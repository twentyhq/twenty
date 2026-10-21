import { getTimelineThreadLabel } from '@/activities/emails/utils/getTimelineThreadLabel';
import { MessageChannelVisibility } from '~/generated/graphql';

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
});
