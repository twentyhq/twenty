import { t } from '@lingui/core/macro';

type GetUnsubscribePageTrackingCopyArgs = {
  senderName: string;
  isOpenTrackingEnabled: boolean;
  isClickTrackingEnabled: boolean;
};

export const getUnsubscribePageTrackingCopy = ({
  senderName,
  isOpenTrackingEnabled,
  isClickTrackingEnabled,
}: GetUnsubscribePageTrackingCopyArgs): {
  description: string;
  keepLabel: string;
} => {
  if (isOpenTrackingEnabled && isClickTrackingEnabled) {
    return {
      description: t`${senderName} may record when you open its emails and which links you click. You can opt out for this email address.`,
      keepLabel: t`Keep tracking my opens and clicks`,
    };
  }

  if (isOpenTrackingEnabled) {
    return {
      description: t`${senderName} may record when you open its emails. You can opt out for this email address.`,
      keepLabel: t`Keep tracking my opens`,
    };
  }

  return {
    description: t`${senderName} may record which links you click in its emails. You can opt out for this email address.`,
    keepLabel: t`Keep tracking my clicks`,
  };
};
