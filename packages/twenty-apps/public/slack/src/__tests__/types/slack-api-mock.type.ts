import { type RequestHandler } from 'msw';

import { type FakeSlackAssistantStatus } from 'src/__tests__/types/fake-slack-assistant-status.type';
import { type FakeSlackAssistantTitle } from 'src/__tests__/types/fake-slack-assistant-title.type';
import { type FakeSlackChannel } from 'src/__tests__/types/fake-slack-channel.type';
import { type FakeSlackEphemeralMessage } from 'src/__tests__/types/fake-slack-ephemeral-message.type';
import { type FakeSlackMessage } from 'src/__tests__/types/fake-slack-message.type';
import { type FakeSlackReaction } from 'src/__tests__/types/fake-slack-reaction.type';
import { type FakeSlackSuggestedPrompts } from 'src/__tests__/types/fake-slack-suggested-prompts.type';
import { type FakeSlackUser } from 'src/__tests__/types/fake-slack-user.type';
import { type SlackApiCall } from 'src/__tests__/types/slack-api-call.type';

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
