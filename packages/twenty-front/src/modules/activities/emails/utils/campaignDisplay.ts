import { type MessageCampaignSummary } from '@/activities/emails/types/MessageCampaign';

export const isDraftCampaign = (campaign: MessageCampaignSummary) =>
  campaign.status === 'DRAFT';

export const formatCampaignRate = (count: number, total: number) => {
  if (total === 0) {
    return '—';
  }

  const percentage = (count / total) * 100;
  const formatted = Number.isInteger(percentage)
    ? percentage.toString()
    : percentage.toFixed(1);

  return `${formatted}% (${count})`;
};

export const formatCampaignDate = (value: string | null) => {
  if (value === null) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};
