import { APPLICATION_ACCESS_TAB_ID } from '@/settings/applications/grant/constants/ApplicationAccessTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const APPLICATION_ACCESS_ADD_OBJECT_ROUTE_PATH = `${SettingsPath.ApplicationDetail}/access/add-object`;

export const APPLICATION_ACCESS_OBJECT_ROUTE_PATH = `${SettingsPath.ApplicationDetail}/access/object/:objectMetadataId`;

export const getApplicationAccessTabPath = (applicationId: string) =>
  getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    APPLICATION_ACCESS_TAB_ID,
  );

export const getApplicationAccessAddObjectPath = (applicationId: string) =>
  `${getSettingsPath(SettingsPath.ApplicationDetail, { applicationId })}/access/add-object`;

export const getApplicationAccessObjectPath = ({
  applicationId,
  objectMetadataId,
}: {
  applicationId: string;
  objectMetadataId: string;
}) =>
  `${getSettingsPath(SettingsPath.ApplicationDetail, { applicationId })}/access/object/${objectMetadataId}`;
