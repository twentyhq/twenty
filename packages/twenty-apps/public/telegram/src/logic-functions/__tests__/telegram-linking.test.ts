import { Response } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { createKvFake } from 'src/__tests__/utils/create-kv-fake';
import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import {
  TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER,
  TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { TELEGRAM_CONNECTED_TEXT } from 'src/logic-functions/constants/telegram-connected-text';
import { TELEGRAM_DISCONNECTED_TEXT } from 'src/logic-functions/constants/telegram-disconnected-text';
import { TELEGRAM_LINK_CONFLICT_TEXT } from 'src/logic-functions/constants/telegram-link-conflict-text';
import { TELEGRAM_LINK_EXPIRED_TEXT } from 'src/logic-functions/constants/telegram-link-expired-text';
import { TELEGRAM_LINK_TOKEN_TTL_MS } from 'src/logic-functions/constants/telegram-link-token-ttl-ms';
import { TELEGRAM_NOT_CONNECTED_TEXT } from 'src/logic-functions/constants/telegram-not-connected-text';
import { telegramStartUserLinkHandler } from 'src/logic-functions/telegram-start-user-link';
import { telegramUpdateHandler } from 'src/logic-functions/telegram-update-handler';
import { telegramUpdatesResolverHandler } from 'src/logic-functions/telegram-updates-resolver';
import { type TelegramUpdate } from 'src/logic-functions/types/telegram-update.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';
import { type TelegramUpdatesDispatchPayload } from 'src/logic-functions/types/telegram-updates-dispatch-payload.type';

const { kvHolder, clientHolder } = vi.hoisted(() => {
  const kvHolder: { kv?: ReturnType<typeof createKvFake>['kv'] } = {};
  const clientHolder: {
    client?: ReturnType<typeof createCoreClientFake>['client'];
  } = {};

  return { kvHolder, clientHolder };
});

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  get kv() {
    return kvHolder.kv;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

const WEBHOOK_SECRET = 'webhook-secret';
const SERVER_ROUTES_URL = 'https://twenty.example/webhooks/server/registration';
const TELEGRAM_USER = { id: 42, first_name: 'Ada', last_name: 'Lovelace' };
const NOW = new Date('2026-11-24T10:00:00.000Z');

const buildMessageUpdate = (
  text: string,
  user: TelegramUser = TELEGRAM_USER,
): TelegramUpdate => ({
  update_id: 1,
  message: {
    message_id: 1,
    chat: { id: user.id, type: 'private' },
    from: user,
    text,
  },
});

const isDispatch = (
  result: unknown,
): result is {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload: TelegramUpdatesDispatchPayload;
} => !(result instanceof Response);

describe('connecting a Telegram account', () => {
  let kvFake: ReturnType<typeof createKvFake>;
  let coreFake: ReturnType<typeof createCoreClientFake>;
  let telegramCalls: ReturnType<typeof stubTelegramApi>;

  const resolve = (update: TelegramUpdate, secret = WEBHOOK_SECRET) =>
    telegramUpdatesResolverHandler({
      headers: { 'x-telegram-bot-api-secret-token': secret },
      body: update,
    });

  const deliver = async (update: TelegramUpdate) => {
    const resolved = await resolve(update);

    if (!isDispatch(resolved)) {
      return { resolved };
    }

    kvFake.actAsWorkspace(resolved.workspaceId);

    return {
      resolved,
      handled: await telegramUpdateHandler(resolved.payload, {
        workspaceId: resolved.workspaceId,
      }),
    };
  };

  const startLink = async ({
    workspaceId = 'workspace-1',
    workspaceMemberId = 'member-1',
  }: { workspaceId?: string; workspaceMemberId?: string } = {}) => {
    kvFake.actAsWorkspace(workspaceId);

    const result = await telegramStartUserLinkHandler(
      {},
      { workspaceMemberId },
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return { ...result, token: new URL(result.url).searchParams.get('start') };
  };

  const sentTexts = () =>
    telegramCalls
      .filter((call) => call.method === 'sendMessage')
      .map((call) => call.params.text);

  const lastSentText = () => sentTexts().pop();

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:bot-token');
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', WEBHOOK_SECRET);
    vi.stubEnv('TWENTY_SERVER_ROUTES_URL', SERVER_ROUTES_URL);

    kvFake = createKvFake();
    coreFake = createCoreClientFake({
      workspaceMemberIds: ['member-1', 'member-2'],
    });
    kvHolder.kv = kvFake.kv;
    clientHolder.client = coreFake.client;
    telegramCalls = stubTelegramApi({
      getMe: { id: 1, username: 'TwentyBot' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns a link to the bot that expires and registers the webhook', async () => {
    const link = await startLink();

    expect(link.url).toMatch(
      /^https:\/\/t\.me\/TwentyBot\?start=[A-Za-z0-9_-]{43}$/,
    );
    expect(link.expiresAt).toBe(
      new Date(NOW.getTime() + TELEGRAM_LINK_TOKEN_TTL_MS).toISOString(),
    );
    expect(telegramCalls).toContainEqual({
      method: 'setWebhook',
      params: {
        url: `${SERVER_ROUTES_URL}/${TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER}`,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message', 'my_chat_member'],
      },
    });
  });

  it('never stores the token itself', async () => {
    const { token } = await startLink();

    expect(
      JSON.stringify([[...kvFake.serverClaims], [...kvFake.workspaceValues]]),
    ).not.toContain(token);
  });

  it('links the account to the member who started the connection', async () => {
    const { startCommand } = await startLink();

    const { resolved, handled } = await deliver(
      buildMessageUpdate(startCommand),
    );

    expect(resolved).toMatchObject({
      workspaceId: 'workspace-1',
      targetLogicFunctionUniversalIdentifier:
        TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER,
    });
    expect(handled).toEqual({ outcome: 'LINKED' });
    expect(coreFake.state.links).toEqual([
      {
        id: 'link-1',
        name: 'Ada Lovelace',
        telegramUserId: '42',
        telegramUsername: '',
        workspaceMemberId: 'member-1',
      },
    ]);
    expect(sentTexts()).toEqual([TELEGRAM_CONNECTED_TEXT]);
  });

  it('routes later messages of a linked account to its workspace', async () => {
    const { token } = await startLink();

    await deliver(buildMessageUpdate(`/start ${token}`));

    const { resolved, handled } = await deliver(buildMessageUpdate('hello'));

    expect(resolved).toMatchObject({ workspaceId: 'workspace-1' });
    expect(handled).toEqual({ outcome: 'CONNECTED' });
  });

  it('accepts a link only once', async () => {
    const { token } = await startLink();

    await deliver(buildMessageUpdate(`/start ${token}`));

    const { resolved } = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(resolved).toEqual(
      new Response(
        {
          method: 'sendMessage',
          chat_id: 42,
          text: TELEGRAM_LINK_EXPIRED_TEXT,
        },
        { headers: { 'content-type': 'application/json' } },
      ),
    );
    expect(coreFake.state.links).toHaveLength(1);
  });

  it('links only one account when two redeem the same link at once', async () => {
    const { token } = await startLink();
    const otherUser = { id: 43, first_name: 'Grace' };

    const deliveries = await Promise.all([
      deliver(buildMessageUpdate(`/start ${token}`)),
      deliver(buildMessageUpdate(`/start ${token}`, otherUser)),
    ]);

    expect(
      deliveries.map((delivery) => delivery.handled?.outcome).sort(),
    ).toEqual(['LINKED', 'LINK_EXPIRED']);
    expect(coreFake.state.links).toHaveLength(1);
    expect(
      [...kvFake.serverClaims.keys()].filter((key) =>
        key.startsWith('telegram-user:'),
      ),
    ).toEqual([`telegram-user:${coreFake.state.links[0].telegramUserId}`]);
  });

  it('refuses a link after it expired', async () => {
    const { token } = await startLink();

    vi.advanceTimersByTime(TELEGRAM_LINK_TOKEN_TTL_MS + 1);

    const { handled } = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(handled).toEqual({ outcome: 'LINK_EXPIRED' });
    expect(coreFake.state.links).toEqual([]);
    expect(sentTexts()).toEqual([TELEGRAM_LINK_EXPIRED_TEXT]);
  });

  it('refuses a link whose member left the workspace', async () => {
    const { token } = await startLink({ workspaceMemberId: 'member-gone' });

    const { handled } = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(handled).toEqual({ outcome: 'LINK_EXPIRED' });
    expect(coreFake.state.links).toEqual([]);
  });

  it('cancels the earlier link when the member asks for a new one', async () => {
    const first = await startLink();
    const second = await startLink();

    const { resolved } = await deliver(
      buildMessageUpdate(`/start ${first.token}`),
    );

    expect(resolved).toBeInstanceOf(Response);
    expect(
      (await deliver(buildMessageUpdate(`/start ${second.token}`))).handled,
    ).toEqual({ outcome: 'LINKED' });
  });

  it('moves the account to another member of the same workspace', async () => {
    await deliver(buildMessageUpdate(`/start ${(await startLink()).token}`));

    const { token } = await startLink({ workspaceMemberId: 'member-2' });
    const { handled } = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(handled).toEqual({ outcome: 'LINKED' });
    expect(coreFake.state.links).toEqual([
      expect.objectContaining({ id: 'link-1', workspaceMemberId: 'member-2' }),
    ]);
  });

  it('keeps an account linked in another workspace until it disconnects', async () => {
    await deliver(buildMessageUpdate(`/start ${(await startLink()).token}`));

    const otherWorkspaceCore = createCoreClientFake({
      workspaceMemberIds: ['member-9'],
    });
    const { token } = await startLink({
      workspaceId: 'workspace-2',
      workspaceMemberId: 'member-9',
    });

    clientHolder.client = otherWorkspaceCore.client;

    const conflict = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(conflict.handled).toEqual({ outcome: 'LINK_CONFLICT' });
    expect(otherWorkspaceCore.state.links).toEqual([]);
    expect(lastSentText()).toBe(TELEGRAM_LINK_CONFLICT_TEXT);

    clientHolder.client = coreFake.client;

    const disconnect = await deliver(buildMessageUpdate('/disconnect'));

    expect(disconnect.resolved).toMatchObject({ workspaceId: 'workspace-1' });
    expect(disconnect.handled).toEqual({ outcome: 'DISCONNECTED' });

    clientHolder.client = otherWorkspaceCore.client;

    const retry = await deliver(buildMessageUpdate(`/start ${token}`));

    expect(retry.resolved).toMatchObject({ workspaceId: 'workspace-2' });
    expect(retry.handled).toEqual({ outcome: 'LINKED' });
    expect(otherWorkspaceCore.state.links).toEqual([
      expect.objectContaining({ workspaceMemberId: 'member-9' }),
    ]);
  });

  it('removes the link on /disconnect and stops routing the account', async () => {
    await deliver(buildMessageUpdate(`/start ${(await startLink()).token}`));

    const { handled } = await deliver(buildMessageUpdate('/disconnect'));

    expect(handled).toEqual({ outcome: 'DISCONNECTED' });
    expect(coreFake.state.links).toEqual([]);
    expect(lastSentText()).toBe(TELEGRAM_DISCONNECTED_TEXT);
    expect((await deliver(buildMessageUpdate('hello'))).resolved).toEqual(
      new Response(
        {
          method: 'sendMessage',
          chat_id: 42,
          text: TELEGRAM_NOT_CONNECTED_TEXT,
        },
        { headers: { 'content-type': 'application/json' } },
      ),
    );
  });

  it('removes the link without replying when the user blocks the bot', async () => {
    await deliver(buildMessageUpdate(`/start ${(await startLink()).token}`));

    const messageCount = sentTexts().length;
    const { handled } = await deliver({
      my_chat_member: {
        chat: { id: 42, type: 'private' },
        from: TELEGRAM_USER,
        new_chat_member: { status: 'kicked' },
      },
    });

    expect(handled).toEqual({ outcome: 'DISCONNECTED' });
    expect(coreFake.state.links).toEqual([]);
    expect(sentTexts()).toHaveLength(messageCount);
  });

  it('frees an account whose link went away with its member', async () => {
    await deliver(buildMessageUpdate(`/start ${(await startLink()).token}`));
    coreFake.state.links = [];

    const { handled } = await deliver(buildMessageUpdate('hello'));

    expect(handled).toEqual({ outcome: 'NOT_CONNECTED' });
    expect(lastSentText()).toBe(TELEGRAM_NOT_CONNECTED_TEXT);
    expect(
      (await deliver(buildMessageUpdate('hello'))).resolved,
    ).toBeInstanceOf(Response);
  });

  it('rejects an update that does not carry the webhook secret', async () => {
    await expect(
      resolve(buildMessageUpdate('hello'), 'wrong-secret'),
    ).resolves.toEqual(
      new Response({ error: 'Unauthorized' }, { status: 401 }),
    );
  });
});
