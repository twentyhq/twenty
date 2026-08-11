import { describe, expect, it } from 'vitest';

import {
  buildSlackAppHomeOpenedEventBody,
  buildSlackMemberJoinedChannelEventBody,
} from 'src/__tests__/utils/build-slack-event-payloads';
import {
  buildSlackAppConnection,
  SLACK_TEST_CONNECTED_ACCOUNT_ID,
  setupSlackIntegrationTest,
} from 'src/__tests__/utils/setup-slack-integration-test';
import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { SLACK_CHANNEL_WELCOME_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-text';
import { SLACK_CHANNEL_WELCOME_THREAD_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-thread-text';
import {
  SLACK_SUGGESTED_PROMPTS,
  SLACK_SUGGESTED_PROMPTS_TITLE,
} from 'src/logic-functions/constants/slack-suggested-prompts';
import { slackAppUninstallHandler } from 'src/logic-functions/handlers/slack-app-uninstall-handler';
import { slackRegisterConnectionHandler } from 'src/logic-functions/handlers/slack-register-connection-handler';
import { slackTeamReleaseHandler } from 'src/logic-functions/handlers/slack-team-release-handler';
import { getSlackChannelWelcomeKvKey } from 'src/logic-functions/utils/get-slack-channel-welcome-kv-key';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';
import { postSlackChannelWelcome } from 'src/logic-functions/utils/post-slack-channel-welcome';
import { setSlackSuggestedPrompts } from 'src/logic-functions/utils/set-slack-suggested-prompts';

const CHANNEL_ID = 'C0WELCOME';
const DIRECT_MESSAGE_CHANNEL_ID = 'D0WELCOME';
const SECOND_CONNECTED_ACCOUNT_ID = 'connected-account-slack-2';

const buildConnectionHookPayload = (connectedAccountId: string) => ({
  connectionProviderId: 'connection-provider-slack',
  connectionProviderName: 'slack',
  connectedAccountId,
});

describe('Slack connection lifecycle', () => {
  const { slack, appRuntime, workspaceId } = setupSlackIntegrationTest();

  describe('registering a connection', () => {
    it('should claim the Slack team for this workspace and cache the bot identity', async () => {
      const result = await slackRegisterConnectionHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );

      expect(result).toEqual({ ok: true, teamId: slack.teamId });
      expect(
        appRuntime.getKeyValue(getSlackTeamKvKey(slack.teamId), 'SERVER'),
      ).toBe(workspaceId);
      expect(
        appRuntime.getKeyValue(
          getSlackConnectedAccountTeamKvKey(SLACK_TEST_CONNECTED_ACCOUNT_ID),
          'WORKSPACE',
        ),
      ).toBe(slack.teamId);
      expect(
        appRuntime.getKeyValue(SLACK_BOT_USER_ID_KV_KEY, 'WORKSPACE'),
      ).toEqual({
        botUserId: slack.botUserId,
        expiresAt: expect.any(Number),
      });
    });

    it('should refuse to register when another workspace already connected the same Slack team', async () => {
      appRuntime.setKeyValue(
        getSlackTeamKvKey(slack.teamId),
        'another-workspace-id',
        'SERVER',
      );

      await expect(
        slackRegisterConnectionHandler(
          buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
        ),
      ).rejects.toThrow('already claimed by another workspace');
    });

    it('should refuse a connection hook payload without a connected account', async () => {
      await expect(
        slackRegisterConnectionHandler(buildConnectionHookPayload('')),
      ).rejects.toThrow('missing connectedAccountId');
      expect(slack.calls).toHaveLength(0);
    });
  });

  describe('removing a connection', () => {
    it('should release the team claim so another workspace can connect it', async () => {
      await slackRegisterConnectionHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );
      appRuntime.setConnections([]);

      const result = await slackTeamReleaseHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );

      expect(result).toEqual({ ok: true, releasedTeamId: slack.teamId });
      expect(
        appRuntime.getKeyValue(getSlackTeamKvKey(slack.teamId), 'SERVER'),
      ).toBeNull();
      expect(
        appRuntime.getKeyValue(
          getSlackConnectedAccountTeamKvKey(SLACK_TEST_CONNECTED_ACCOUNT_ID),
          'WORKSPACE',
        ),
      ).toBeNull();
    });

    it('should keep the team claim while another connection of this workspace still uses it', async () => {
      appRuntime.setConnections([
        buildSlackAppConnection(slack.botToken),
        buildSlackAppConnection(slack.botToken, {
          id: SECOND_CONNECTED_ACCOUNT_ID,
        }),
      ]);
      await slackRegisterConnectionHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );
      await slackRegisterConnectionHandler(
        buildConnectionHookPayload(SECOND_CONNECTED_ACCOUNT_ID),
      );

      const result = await slackTeamReleaseHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );

      expect(result).toEqual({ ok: true, releasedTeamId: null });
      expect(
        appRuntime.getKeyValue(getSlackTeamKvKey(slack.teamId), 'SERVER'),
      ).toBe(workspaceId);
    });
  });

  describe('uninstalling the app', () => {
    it('should release the team claim of every remaining connection', async () => {
      await slackRegisterConnectionHandler(
        buildConnectionHookPayload(SLACK_TEST_CONNECTED_ACCOUNT_ID),
      );

      const result = await slackAppUninstallHandler();

      expect(result).toEqual({ ok: true, releasedTeamIds: [slack.teamId] });
      expect(
        appRuntime.getKeyValue(getSlackTeamKvKey(slack.teamId), 'SERVER'),
      ).toBeNull();
    });
  });

  describe('channel welcome', () => {
    it('should introduce itself once when the bot is added to a channel', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'sales' });

      const result = await postSlackChannelWelcome(
        buildSlackMemberJoinedChannelEventBody({
          channelId: CHANNEL_ID,
          userId: slack.botUserId,
        }),
      );

      expect(result).toEqual({ ok: true });

      const [channelMessage, threadReply] = slack.messagesIn(CHANNEL_ID);

      expect(channelMessage.markdownText).toBe(SLACK_CHANNEL_WELCOME_TEXT);
      expect(threadReply).toEqual(
        expect.objectContaining({
          markdownText: SLACK_CHANNEL_WELCOME_THREAD_TEXT,
          threadTimestamp: channelMessage.timestamp,
        }),
      );
    });

    it('should stay quiet when the bot is re-added to a channel it already welcomed', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
      const eventBody = buildSlackMemberJoinedChannelEventBody({
        channelId: CHANNEL_ID,
        userId: slack.botUserId,
      });

      await postSlackChannelWelcome(eventBody);
      const secondResult = await postSlackChannelWelcome(eventBody);

      expect(secondResult).toEqual({
        ok: true,
        skipped: 'Channel was already welcomed',
      });
      expect(slack.messagesIn(CHANNEL_ID)).toHaveLength(2);
    });

    it('should stay quiet when somebody else joins the channel', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'sales' });

      const result = await postSlackChannelWelcome(
        buildSlackMemberJoinedChannelEventBody({
          channelId: CHANNEL_ID,
          userId: 'U0COLLEAGUE',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Someone other than the bot joined',
      });
      expect(slack.messagesIn(CHANNEL_ID)).toHaveLength(0);
    });

    it('should reuse the cached bot user id instead of asking Slack again', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
      appRuntime.setKeyValue(SLACK_BOT_USER_ID_KV_KEY, {
        botUserId: slack.botUserId,
        expiresAt: Date.now() + 60_000,
      });

      await postSlackChannelWelcome(
        buildSlackMemberJoinedChannelEventBody({
          channelId: CHANNEL_ID,
          userId: slack.botUserId,
        }),
      );

      expect(slack.callsTo('auth.test')).toHaveLength(0);
    });

    it('should give the welcome claim back when Slack refuses the message', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
      slack.failNextCall('chat.postMessage', 'not_in_channel');

      await expect(
        postSlackChannelWelcome(
          buildSlackMemberJoinedChannelEventBody({
            channelId: CHANNEL_ID,
            userId: slack.botUserId,
          }),
        ),
      ).rejects.toThrow('Failed to post the Slack welcome');

      expect(
        appRuntime.getKeyValue(
          getSlackChannelWelcomeKvKey(CHANNEL_ID),
          'WORKSPACE',
        ),
      ).toBeNull();
    });
  });

  describe('app home', () => {
    it('should set the suggested prompts when a member opens the messages tab', async () => {
      const result = await setSlackSuggestedPrompts(
        buildSlackAppHomeOpenedEventBody({
          channelId: DIRECT_MESSAGE_CHANNEL_ID,
        }),
      );

      expect(result).toEqual({ ok: true });
      expect(slack.suggestedPrompts).toEqual([
        {
          channelId: DIRECT_MESSAGE_CHANNEL_ID,
          title: SLACK_SUGGESTED_PROMPTS_TITLE,
          prompts: SLACK_SUGGESTED_PROMPTS,
        },
      ]);
    });

    it('should ignore the home tab', async () => {
      const result = await setSlackSuggestedPrompts(
        buildSlackAppHomeOpenedEventBody({
          channelId: DIRECT_MESSAGE_CHANNEL_ID,
          tab: 'home',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Unhandled app home tab: home',
      });
      expect(slack.calls).toHaveLength(0);
    });
  });
});
