import { t } from '@lingui/core/macro';

type GetUnsubscribePageHeaderDescriptionArgs = {
  recipientEmailAddress: string;
  hasPublicTopics: boolean;
  isTrackingActive: boolean;
};

export const getUnsubscribePageHeaderDescription = ({
  recipientEmailAddress,
  hasPublicTopics,
  isTrackingActive,
}: GetUnsubscribePageHeaderDescriptionArgs): string => {
  if (hasPublicTopics) {
    return t`Uncheck the emails you no longer want at ${recipientEmailAddress}.`;
  }

  if (isTrackingActive) {
    return t`Email preferences for ${recipientEmailAddress}`;
  }

  return t`You will stop receiving these emails at ${recipientEmailAddress}.`;
};
