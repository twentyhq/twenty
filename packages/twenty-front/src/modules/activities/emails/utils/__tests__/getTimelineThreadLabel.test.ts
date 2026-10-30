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
          applicationId: '0d6e3f2a-4b1c-4e8a-9f3d-2c5b7a1e6d40',
        },
      }),
    ).toBe('Conversation');
  });
});
