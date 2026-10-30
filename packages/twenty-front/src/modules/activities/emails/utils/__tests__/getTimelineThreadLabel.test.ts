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

  it('should fall back to a conversation label for chat channels', () => {
    expect(
      getTimelineThreadLabel({
        subject: '',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        channel: {
          type: MessageChannelType.APP,
          provider: 'app',
          connectionProviderName: 'linkedin',
        },
      }),
    ).toBe('Conversation');
  });
});
