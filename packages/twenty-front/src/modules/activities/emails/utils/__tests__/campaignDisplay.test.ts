import {
  formatCampaignRate,
  isDraftCampaign,
} from '@/activities/emails/utils/campaignDisplay';
import { type MessageCampaignSummary } from '@/activities/emails/types/MessageCampaign';

const campaign = (status: string) => ({ status }) as MessageCampaignSummary;

describe('campaignDisplay', () => {
  it('formats trustworthy delivery counts as rates with counts', () => {
    expect(formatCampaignRate(2, 8)).toBe('25% (2)');
    expect(formatCampaignRate(1, 3)).toBe('33.3% (1)');
    expect(formatCampaignRate(0, 0)).toBe('—');
  });

  it('only classifies DRAFT campaigns as drafts', () => {
    expect(isDraftCampaign(campaign('DRAFT'))).toBe(true);
    expect(isDraftCampaign(campaign('SENT'))).toBe(false);
    expect(isDraftCampaign(campaign('SENDING'))).toBe(false);
  });
});
