import { t } from '@lingui/core/macro';

export const getAppAccountReconnectLabel = ({
  applicationName,
  connectionLabel,
  hasOtherConnectionForApplication,
  isLabelledByApplication,
}: {
  applicationName: string;
  connectionLabel: string;
  hasOtherConnectionForApplication: boolean;
  isLabelledByApplication: boolean;
}): string => {
  if (hasOtherConnectionForApplication) {
    return t`Reconnect ${applicationName} (${connectionLabel})`;
  }

  if (isLabelledByApplication) {
    return t`Reconnect ${applicationName}`;
  }

  return t`Reconnect`;
};
