import { t } from '@lingui/core/macro';

export const getAppAccountActionLabel = ({
  action,
  applicationName,
  connectionLabel,
  hasOtherConnectionForApplication,
  isLabelledByApplication,
}: {
  action: 'reconnect' | 'remove';
  applicationName: string;
  connectionLabel: string;
  hasOtherConnectionForApplication: boolean;
  isLabelledByApplication: boolean;
}): string => {
  if (action === 'reconnect') {
    if (hasOtherConnectionForApplication) {
      return t`Reconnect ${applicationName} (${connectionLabel})`;
    }

    if (isLabelledByApplication) {
      return t`Reconnect ${applicationName}`;
    }

    return t`Reconnect`;
  }

  if (hasOtherConnectionForApplication) {
    return t`Remove ${applicationName} (${connectionLabel})`;
  }

  if (isLabelledByApplication) {
    return t`Remove ${applicationName}`;
  }

  return t`Remove`;
};
