import { MessageCampaignStatus } from 'twenty-shared/types';

import { getMessageCampaignStatusBadge } from '@/activities/emails/utils/getMessageCampaignStatusBadge';

describe('getMessageCampaignStatusBadge', () => {
  it('should badge sending campaigns as yellow', () => {
    expect(
      getMessageCampaignStatusBadge(MessageCampaignStatus.SENDING),
    ).toEqual({ color: 'yellow', label: 'Sending' });
  });

  it('should badge sent campaigns as green', () => {
    expect(getMessageCampaignStatusBadge(MessageCampaignStatus.SENT)).toEqual({
      color: 'green',
      label: 'Sent',
    });
  });

  it('should badge partially failed campaigns as orange', () => {
    expect(
      getMessageCampaignStatusBadge(MessageCampaignStatus.SENT_WITH_ERRORS),
    ).toEqual({ color: 'orange', label: 'Sent with errors' });
  });
});
