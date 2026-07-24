import { t } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { type ThemeColor } from 'twenty-ui/theme';

type MessageCampaignStatusBadge = {
  color: ThemeColor;
  label: string;
};

export const getMessageCampaignStatusBadge = (
  status: MessageCampaignStatus,
): MessageCampaignStatusBadge => {
  switch (status) {
    case MessageCampaignStatus.DRAFT:
      return { color: 'gray', label: t`Draft` };
    case MessageCampaignStatus.SCHEDULED:
      return { color: 'blue', label: t`Scheduled` };
    case MessageCampaignStatus.SENDING:
      return { color: 'yellow', label: t`Sending` };
    case MessageCampaignStatus.SENT:
      return { color: 'green', label: t`Sent` };
    case MessageCampaignStatus.SENT_WITH_ERRORS:
      return { color: 'orange', label: t`Sent with errors` };
    default:
      return { color: 'gray', label: t`Unknown` };
  }
};
