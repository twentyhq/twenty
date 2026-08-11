import { http, HttpResponse, type RequestHandler } from 'msw';

const SLACK_API_BASE_URL = 'https://slack.com/api';

export type SlackApiCall = {
  method: string;
  args: Record<string, unknown>;
};

export type FakeSlackChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  numMembers: number;
  topic: string;
  purpose: string;
};

export type FakeSlackMessage = {
  channelId: string;
  timestamp: string;
  threadTimestamp?: string;
  userId?: string;
  botId?: string;
  text?: string;
  markdownText?: string;
  blocks?: unknown[];
};

export type FakeSlackEphemeralMessage = {
  channelId: string;
  recipientUserId: string;
  threadTimestamp?: string;
  text?: string;
  markdownText?: string;
};

export type FakeSlackReaction = {
  channelId: string;
  messageTimestamp: string;
  emojiName: string;
};

export type FakeSlackAssistantStatus = {
  channelId: string;
  threadTimestamp: string;
  status: string;
};

export type FakeSlackAssistantTitle = {
  channelId: string;
  threadTimestamp: string;
  title: string;
};

export type FakeSlackSuggestedPrompts = {
  channelId: string;
  title: string;
  prompts: unknown[];
};

export type FakeSlackUser = {
  id: string;
  displayName?: string;
  realName?: string;
};

export type SlackApiMockOptions = {
  botToken?: string;
  botUserId?: string;
  teamId?: string;
};

export type SlackApiMock = {
  handlers: RequestHandler[];
  botToken: string;
  botUserId: string;
  teamId: string;
  addChannel: (
    channel: Pick<FakeSlackChannel, 'id' | 'name'> & Partial<FakeSlackChannel>,
  ) => FakeSlackChannel;
  addUser: (user: FakeSlackUser) => void;
  addMessage: (
    message: Pick<FakeSlackMessage, 'channelId'> & Partial<FakeSlackMessage>,
  ) => FakeSlackMessage;
  failNextCall: (method: string, errorCode: string) => void;
  rejectMarkdownText: () => void;
  rejectBlocks: () => void;
  readonly calls: SlackApiCall[];
  callsTo: (method: string) => SlackApiCall[];
  lastCallTo: (method: string) => SlackApiCall | undefined;
  messagesIn: (channelId: string) => FakeSlackMessage[];
  readonly ephemeralMessages: FakeSlackEphemeralMessage[];
  readonly reactions: FakeSlackReaction[];
  readonly assistantStatuses: FakeSlackAssistantStatus[];
  readonly assistantTitles: FakeSlackAssistantTitle[];
  readonly suggestedPrompts: FakeSlackSuggestedPrompts[];
  reset: () => void;
};

export const DEFAULT_SLACK_BOT_TOKEN = 'xoxb-test-token';
export const DEFAULT_SLACK_BOT_USER_ID = 'U0BOTTEST0';
export const DEFAULT_SLACK_TEAM_ID = 'T0TESTTEAM';

// Slack answers logical failures with HTTP 200 and `ok: false`; @slack/web-api
// turns those into thrown errors carrying `data.error`.
const slackError = (errorCode: string) =>
  HttpResponse.json({ ok: false, error: errorCode });

const parseSlackArgumentValue = (value: string): unknown => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const parseSlackRequestArgs = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  const args: Record<string, unknown> = {};

  new URLSearchParams(await request.text()).forEach((value, key) => {
    args[key] = parseSlackArgumentValue(value);
  });

  return args;
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

export const createSlackApiMock = ({
  botToken = DEFAULT_SLACK_BOT_TOKEN,
  botUserId = DEFAULT_SLACK_BOT_USER_ID,
  teamId = DEFAULT_SLACK_TEAM_ID,
}: SlackApiMockOptions = {}): SlackApiMock => {
  let timestampSequence = 0;
  let channels: FakeSlackChannel[] = [];
  let messages: FakeSlackMessage[] = [];
  let users: FakeSlackUser[] = [];
  let ephemeralMessages: FakeSlackEphemeralMessage[] = [];
  let reactions: FakeSlackReaction[] = [];
  let assistantStatuses: FakeSlackAssistantStatus[] = [];
  let assistantTitles: FakeSlackAssistantTitle[] = [];
  let suggestedPrompts: FakeSlackSuggestedPrompts[] = [];
  let calls: SlackApiCall[] = [];
  let queuedErrorsByMethod = new Map<string, string[]>();
  let rejectsMarkdownText = false;
  let rejectsBlocks = false;

  const nextTimestamp = (): string => {
    timestampSequence += 1;

    return `1700000000.${String(timestampSequence).padStart(6, '0')}`;
  };

  const findChannel = (channelId: unknown): FakeSlackChannel | undefined =>
    channels.find((channel) => channel.id === channelId);

  const findMessage = (
    channelId: unknown,
    timestamp: unknown,
  ): FakeSlackMessage | undefined =>
    messages.find(
      (message) =>
        message.channelId === channelId && message.timestamp === timestamp,
    );

  const takeQueuedError = (method: string): string | undefined =>
    queuedErrorsByMethod.get(method)?.shift();

  const paginate = <TItem>(
    items: TItem[],
    { limit, cursor }: { limit: unknown; cursor: unknown },
  ): { page: TItem[]; nextCursor: string } => {
    const offset = Number(asString(cursor) ?? '0');
    const pageSize = Number(asString(limit) ?? String(items.length));
    const page = items.slice(offset, offset + pageSize);
    const nextOffset = offset + page.length;

    return {
      page,
      nextCursor: nextOffset < items.length ? String(nextOffset) : '',
    };
  };

  const postMessage = (args: Record<string, unknown>) => {
    if (rejectsMarkdownText && args.markdown_text !== undefined) {
      return slackError('invalid_arguments');
    }

    if (rejectsBlocks && args.blocks !== undefined) {
      return slackError('invalid_blocks');
    }

    const channel = findChannel(args.channel);

    if (channel === undefined) {
      return slackError('channel_not_found');
    }

    const message: FakeSlackMessage = {
      channelId: channel.id,
      timestamp: nextTimestamp(),
      threadTimestamp: asString(args.thread_ts),
      botId: 'B0TESTBOT0',
      text: asString(args.text),
      markdownText: asString(args.markdown_text),
      blocks: Array.isArray(args.blocks) ? args.blocks : undefined,
    };

    messages.push(message);

    return HttpResponse.json({
      ok: true,
      channel: channel.id,
      ts: message.timestamp,
      message: { ts: message.timestamp, text: message.text },
    });
  };

  const updateMessage = (args: Record<string, unknown>) => {
    if (rejectsMarkdownText && args.markdown_text !== undefined) {
      return slackError('invalid_arguments');
    }

    const message = findMessage(args.channel, args.ts);

    if (message === undefined) {
      return slackError('message_not_found');
    }

    message.text = asString(args.text);
    message.markdownText = asString(args.markdown_text);
    message.blocks = Array.isArray(args.blocks) ? args.blocks : undefined;

    return HttpResponse.json({
      ok: true,
      channel: message.channelId,
      ts: message.timestamp,
    });
  };

  const deleteMessage = (args: Record<string, unknown>) => {
    const message = findMessage(args.channel, args.ts);

    if (message === undefined) {
      return slackError('message_not_found');
    }

    messages = messages.filter((candidate) => candidate !== message);

    return HttpResponse.json({
      ok: true,
      channel: message.channelId,
      ts: message.timestamp,
    });
  };

  const postEphemeralMessage = (args: Record<string, unknown>) => {
    const channel = findChannel(args.channel);

    if (channel === undefined) {
      return slackError('channel_not_found');
    }

    ephemeralMessages.push({
      channelId: channel.id,
      recipientUserId: asString(args.user) ?? '',
      threadTimestamp: asString(args.thread_ts),
      text: asString(args.text),
      markdownText: asString(args.markdown_text),
    });

    return HttpResponse.json({ ok: true, message_ts: nextTimestamp() });
  };

  const changeReaction = (
    operation: 'add' | 'remove',
    args: Record<string, unknown>,
  ) => {
    const message = findMessage(args.channel, args.timestamp);

    if (message === undefined) {
      return slackError('message_not_found');
    }

    const emojiName = asString(args.name) ?? '';
    const existingReaction = reactions.find(
      (reaction) =>
        reaction.channelId === message.channelId &&
        reaction.messageTimestamp === message.timestamp &&
        reaction.emojiName === emojiName,
    );

    if (operation === 'add') {
      if (existingReaction !== undefined) {
        return slackError('already_reacted');
      }

      reactions.push({
        channelId: message.channelId,
        messageTimestamp: message.timestamp,
        emojiName,
      });

      return HttpResponse.json({ ok: true });
    }

    if (existingReaction === undefined) {
      return slackError('no_reaction');
    }

    reactions = reactions.filter((reaction) => reaction !== existingReaction);

    return HttpResponse.json({ ok: true });
  };

  const listChannels = (args: Record<string, unknown>) => {
    const requestedTypes = (asString(args.types) ?? 'public_channel').split(
      ',',
    );
    const matchingChannels = channels.filter((channel) => {
      const matchesType = requestedTypes.includes(
        channel.isPrivate ? 'private_channel' : 'public_channel',
      );

      return (
        matchesType && !(args.exclude_archived === true && channel.isArchived)
      );
    });

    const { page, nextCursor } = paginate(matchingChannels, {
      limit: args.limit,
      cursor: args.cursor,
    });

    return HttpResponse.json({
      ok: true,
      channels: page.map((channel) => ({
        id: channel.id,
        name: channel.name,
        is_private: channel.isPrivate,
        is_archived: channel.isArchived,
        is_member: channel.isMember,
        num_members: channel.numMembers,
        topic: { value: channel.topic },
        purpose: { value: channel.purpose },
      })),
      response_metadata: { next_cursor: nextCursor },
    });
  };

  const listThreadReplies = (args: Record<string, unknown>) => {
    const threadTimestamp = asString(args.ts);
    const threadMessages = messages.filter(
      (message) =>
        message.channelId === args.channel &&
        (message.timestamp === threadTimestamp ||
          message.threadTimestamp === threadTimestamp),
    );

    const { page, nextCursor } = paginate(threadMessages, {
      limit: args.limit,
      cursor: args.cursor,
    });

    return HttpResponse.json({
      ok: true,
      messages: page.map((message) => ({
        ts: message.timestamp,
        thread_ts: message.threadTimestamp,
        user: message.userId,
        bot_id: message.botId,
        text: message.text ?? message.markdownText,
      })),
      response_metadata: { next_cursor: nextCursor },
    });
  };

  const getUserInfo = (args: Record<string, unknown>) => {
    const user = users.find((candidate) => candidate.id === args.user);

    if (user === undefined) {
      return slackError('users_not_found');
    }

    return HttpResponse.json({
      ok: true,
      user: {
        id: user.id,
        real_name: user.realName,
        profile: { display_name: user.displayName },
      },
    });
  };

  const handleSlackMethod = (method: string, args: Record<string, unknown>) => {
    switch (method) {
      case 'auth.test':
        return HttpResponse.json({
          ok: true,
          url: 'https://twenty-test.slack.com/',
          team: 'Twenty Test',
          team_id: teamId,
          user: 'twenty',
          user_id: botUserId,
          bot_id: 'B0TESTBOT0',
        });
      case 'chat.postMessage':
        return postMessage(args);
      case 'chat.update':
        return updateMessage(args);
      case 'chat.delete':
        return deleteMessage(args);
      case 'chat.postEphemeral':
        return postEphemeralMessage(args);
      case 'reactions.add':
        return changeReaction('add', args);
      case 'reactions.remove':
        return changeReaction('remove', args);
      case 'conversations.list':
        return listChannels(args);
      case 'conversations.replies':
        return listThreadReplies(args);
      case 'users.info':
        return getUserInfo(args);
      case 'assistant.threads.setStatus':
        assistantStatuses.push({
          channelId: asString(args.channel_id) ?? '',
          threadTimestamp: asString(args.thread_ts) ?? '',
          status: asString(args.status) ?? '',
        });

        return HttpResponse.json({ ok: true });
      case 'assistant.threads.setTitle':
        assistantTitles.push({
          channelId: asString(args.channel_id) ?? '',
          threadTimestamp: asString(args.thread_ts) ?? '',
          title: asString(args.title) ?? '',
        });

        return HttpResponse.json({ ok: true });
      case 'assistant.threads.setSuggestedPrompts':
        suggestedPrompts.push({
          channelId: asString(args.channel_id) ?? '',
          title: asString(args.title) ?? '',
          prompts: Array.isArray(args.prompts) ? args.prompts : [],
        });

        return HttpResponse.json({ ok: true });
      default:
        return slackError('unknown_method');
    }
  };

  const handlers: RequestHandler[] = [
    http.post(`${SLACK_API_BASE_URL}/:method`, async ({ request, params }) => {
      const method = String(params.method);
      const args = await parseSlackRequestArgs(request);

      calls.push({ method, args });

      if (request.headers.get('authorization') !== `Bearer ${botToken}`) {
        return slackError('invalid_auth');
      }

      const queuedError = takeQueuedError(method);

      if (queuedError !== undefined) {
        return slackError(queuedError);
      }

      return handleSlackMethod(method, args);
    }),
  ];

  return {
    handlers,
    botToken,
    botUserId,
    teamId,

    addChannel: (
      channel: Pick<FakeSlackChannel, 'id' | 'name'> &
        Partial<FakeSlackChannel>,
    ): FakeSlackChannel => {
      const fakeChannel: FakeSlackChannel = {
        isPrivate: false,
        isArchived: false,
        isMember: true,
        numMembers: 3,
        topic: '',
        purpose: '',
        ...channel,
      };

      channels.push(fakeChannel);

      return fakeChannel;
    },

    addUser: (user: FakeSlackUser): void => {
      users.push(user);
    },

    addMessage: (
      message: Pick<FakeSlackMessage, 'channelId'> & Partial<FakeSlackMessage>,
    ): FakeSlackMessage => {
      const fakeMessage: FakeSlackMessage = {
        timestamp: nextTimestamp(),
        ...message,
      };

      messages.push(fakeMessage);

      return fakeMessage;
    },

    // Makes the next call to `method` answer with a Slack error code, the way
    // a real workspace rejects a call it cannot serve.
    failNextCall: (method: string, errorCode: string): void => {
      queuedErrorsByMethod.set(method, [
        ...(queuedErrorsByMethod.get(method) ?? []),
        errorCode,
      ]);
    },

    // Older Slack workspaces reject `markdown_text` and `blocks` payloads.
    rejectMarkdownText: (): void => {
      rejectsMarkdownText = true;
    },

    rejectBlocks: (): void => {
      rejectsBlocks = true;
    },

    get calls(): SlackApiCall[] {
      return calls;
    },

    callsTo: (method: string): SlackApiCall[] =>
      calls.filter((call) => call.method === method),

    lastCallTo: (method: string): SlackApiCall | undefined => {
      const matchingCalls = calls.filter((call) => call.method === method);

      return matchingCalls[matchingCalls.length - 1];
    },

    messagesIn: (channelId: string): FakeSlackMessage[] =>
      messages.filter((message) => message.channelId === channelId),

    get ephemeralMessages(): FakeSlackEphemeralMessage[] {
      return ephemeralMessages;
    },

    get reactions(): FakeSlackReaction[] {
      return reactions;
    },

    get assistantStatuses(): FakeSlackAssistantStatus[] {
      return assistantStatuses;
    },

    get assistantTitles(): FakeSlackAssistantTitle[] {
      return assistantTitles;
    },

    get suggestedPrompts(): FakeSlackSuggestedPrompts[] {
      return suggestedPrompts;
    },

    reset: (): void => {
      timestampSequence = 0;
      channels = [];
      messages = [];
      users = [];
      ephemeralMessages = [];
      reactions = [];
      assistantStatuses = [];
      assistantTitles = [];
      suggestedPrompts = [];
      calls = [];
      queuedErrorsByMethod = new Map();
      rejectsMarkdownText = false;
      rejectsBlocks = false;
    },
  };
};
