import { type ApplicationGrantEditorContextValue } from '@/settings/applications/grant/contexts/ApplicationGrantEditorContext';
import {
  getApplicationAccessAddObjectPath,
  getApplicationAccessObjectPath,
  getApplicationAccessTabPath,
} from '@/settings/applications/grant/utils/getApplicationAccessPath';
import { t } from '@lingui/core/macro';
import { type ObjectPermissionAction } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const buildApplicationAccessEditorContextValue = ({
  applicationId,
  applicationName,
  lockedActionsByObjectMetadataId,
}: {
  applicationId: string;
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
      href: getSettingsPath(SettingsPath.ApplicationDetail, { applicationId }),
    },
    { children: t`Access`, href: getApplicationAccessTabPath(applicationId) },
  ],
  editorPath: getApplicationAccessTabPath(applicationId),
  addObjectPath: getApplicationAccessAddObjectPath(applicationId),
  getObjectPath: (objectMetadataId) =>
    getApplicationAccessObjectPath({ applicationId, objectMetadataId }),
});
