import { getTimelineThreadLabel } from '@/activities/emails/utils/getTimelineThreadLabel';
import {
  MessageChannelType,
  MessageChannelVisibility,
} from '~/generated/graphql';

describe('getTimelineThreadLabel', () => {
  it('should return the subject when it is shared', () => {
    expect(
      getTimelineThreadLabel({
        subject: 'Renewal proposal',
        visibility: MessageChannelVisibility.SUBJECT,
      }),
    ).toBe('Renewal proposal');
  });

  it('should hide the subject when only metadata is shared', () => {
    expect(
      getTimelineThreadLabel({
        subject: 'Renewal proposal',
        visibility: MessageChannelVisibility.METADATA,
      }),
    ).toBe('Email thread');
  });

  it('should fall back when the subject is empty', () => {
    expect(
      getTimelineThreadLabel({
        subject: '',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      }),
    ).toBe('Email thread');
  });

  const chatChannel = {
    type: MessageChannelType.APP,
    provider: 'app',
    applicationId: null,
    conversationStyle: 'chat',
  };

  it('should use the conversation name for app chats', () => {
    expect(
      getTimelineThreadLabel({
        subject: 'Family group',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        channel: chatChannel,
      }),
    ).toBe('Family group');
  });

  it('should use a conversation label for app chats without a visible name', () => {
    expect(
      getTimelineThreadLabel({
        subject: 'Family group',
        visibility: MessageChannelVisibility.METADATA,
        channel: chatChannel,
      }),
    ).toBe('Conversation');
  });
});
