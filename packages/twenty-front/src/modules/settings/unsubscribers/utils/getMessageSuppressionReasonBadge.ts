import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';
import { MessageSuppressionReason } from '~/generated-metadata/graphql';

type MessageSuppressionReasonBadge = {
  color: ThemeColor;
  label: string;
};

export const getMessageSuppressionReasonBadge = (
  reason: MessageSuppressionReason,
): MessageSuppressionReasonBadge => {
  switch (reason) {
    case MessageSuppressionReason.UNSUBSCRIBE:
      return { color: 'gray', label: t`Unsubscribed` };
    case MessageSuppressionReason.COMPLAINT:
      return { color: 'red', label: t`Complaint` };
    case MessageSuppressionReason.BOUNCE:
      return { color: 'orange', label: t`Bounce` };
    default:
      return { color: 'gray', label: t`Unknown` };
  }
};
