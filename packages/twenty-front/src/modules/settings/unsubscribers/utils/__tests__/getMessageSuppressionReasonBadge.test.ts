import { getMessageSuppressionReasonBadge } from '@/settings/unsubscribers/utils/getMessageSuppressionReasonBadge';
import { MessageSuppressionReason } from '~/generated-metadata/graphql';

describe('getMessageSuppressionReasonBadge', () => {
  it('should badge unsubscribes as gray', () => {
    expect(
      getMessageSuppressionReasonBadge(MessageSuppressionReason.UNSUBSCRIBE),
    ).toEqual({ color: 'gray', label: 'Unsubscribed' });
  });

  it('should badge complaints as red', () => {
    expect(
      getMessageSuppressionReasonBadge(MessageSuppressionReason.COMPLAINT),
    ).toEqual({ color: 'red', label: 'Complaint' });
  });

  it('should badge bounces as orange', () => {
    expect(
      getMessageSuppressionReasonBadge(MessageSuppressionReason.BOUNCE),
    ).toEqual({ color: 'orange', label: 'Bounce' });
  });
});
