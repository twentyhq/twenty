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

  it('should use a conversation label for app chats, even with a subject', () => {
    expect(
      getTimelineThreadLabel({
        subject: 'Intro call',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        channel: {
          type: MessageChannelType.APP,
          provider: 'app',
          applicationId: null,
          conversationStyle: 'chat',
        },
      }),
    ).toBe('Conversation');
  });
});
