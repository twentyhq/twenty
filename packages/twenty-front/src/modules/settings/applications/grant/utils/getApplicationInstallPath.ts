import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const APPLICATION_INSTALL_ROUTE_PATH = `${SettingsPath.AvailableApplicationDetail}/install`;

export const APPLICATION_INSTALL_CUSTOMIZE_ROUTE_PATH = `${APPLICATION_INSTALL_ROUTE_PATH}/customize`;

export const APPLICATION_INSTALL_ADD_OBJECT_ROUTE_PATH = `${APPLICATION_INSTALL_CUSTOMIZE_ROUTE_PATH}/add-object`;

export const APPLICATION_INSTALL_OBJECT_ROUTE_PATH = `${APPLICATION_INSTALL_CUSTOMIZE_ROUTE_PATH}/object/:objectMetadataId`;

const getAvailableApplicationPath = (universalIdentifier: string) =>
  getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: universalIdentifier,
  });

export const getApplicationInstallPath = (universalIdentifier: string) =>
  `${getAvailableApplicationPath(universalIdentifier)}/install`;

export const getApplicationInstallCustomizePath = (
  universalIdentifier: string,
) => `${getApplicationInstallPath(universalIdentifier)}/customize`;

export const getApplicationInstallAddObjectPath = (
  universalIdentifier: string,
) => `${getApplicationInstallCustomizePath(universalIdentifier)}/add-object`;

export const getApplicationInstallObjectPath = ({
  universalIdentifier,
  objectMetadataId,
}: {
  universalIdentifier: string;
  objectMetadataId: string;
}) =>
  `${getApplicationInstallCustomizePath(universalIdentifier)}/object/${objectMetadataId}`;
