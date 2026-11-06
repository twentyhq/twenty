import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const getApplicationContentPath = ({
  location,
  contentType,
}: {
  location: ApplicationContentLocation;
  contentType?: ApplicationContentType;
}) => {
  if (location.kind === 'installed') {
    return isDefined(contentType)
      ? getSettingsPath(SettingsPath.ApplicationContentTypeDetail, {
          applicationId: location.applicationId,
          contentType,
        })
      : getSettingsPath(SettingsPath.ApplicationContent, {
          applicationId: location.applicationId,
        });
  }

  return isDefined(contentType)
    ? getSettingsPath(SettingsPath.AvailableApplicationContentTypeDetail, {
        availableApplicationId: location.availableApplicationId,
        contentType,
      })
    : getSettingsPath(SettingsPath.AvailableApplicationContent, {
        availableApplicationId: location.availableApplicationId,
      });
};
