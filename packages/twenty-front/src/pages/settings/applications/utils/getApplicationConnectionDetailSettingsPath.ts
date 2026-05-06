import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SETTINGS_APPLICATION_CONNECTION_DETAIL_PATH = `${SettingsPath.ApplicationDetail}/connections/:connectedAccountId`;

export const getApplicationConnectionDetailSettingsPath = ({
  applicationId,
  connectedAccountId,
}: {
  applicationId: string;
  connectedAccountId: string;
}) =>
  `${getSettingsPath(SettingsPath.ApplicationDetail, {
    applicationId,
  })}/connections/${connectedAccountId}`;
