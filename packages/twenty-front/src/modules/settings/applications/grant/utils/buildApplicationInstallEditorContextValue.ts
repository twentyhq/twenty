import { type ApplicationGrantEditorContextValue } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import {
  getApplicationInstallAddObjectPath,
  getApplicationInstallCustomizePath,
  getApplicationInstallObjectPath,
  getApplicationInstallPath,
} from '@/settings/applications/grant/utils/getApplicationInstallPath';
import { t } from '@lingui/core/macro';
import { type ObjectPermissionAction } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const buildApplicationInstallEditorContextValue = ({
  universalIdentifier,
  applicationName,
  lockedActionsByObjectMetadataId,
}: {
  universalIdentifier: string;
  applicationName: string;
  lockedActionsByObjectMetadataId: Map<string, ObjectPermissionAction[]>;
}): ApplicationGrantEditorContextValue => ({
  applicationName,
  lockedActionsByObjectMetadataId,
  editorBreadcrumbLinks: [
    { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
    { children: t`Apps`, href: getSettingsPath(SettingsPath.Applications) },
    {
      children: applicationName,
      href: getSettingsPath(SettingsPath.AvailableApplicationDetail, {
        availableApplicationId: universalIdentifier,
      }),
    },
    {
      children: t`Install`,
      href: getApplicationInstallPath(universalIdentifier),
    },
    {
      children: t`Customize`,
      href: getApplicationInstallCustomizePath(universalIdentifier),
    },
  ],
  editorPath: getApplicationInstallCustomizePath(universalIdentifier),
  addObjectPath: getApplicationInstallAddObjectPath(universalIdentifier),
  getObjectPath: (objectMetadataId) =>
    getApplicationInstallObjectPath({ universalIdentifier, objectMetadataId }),
});
