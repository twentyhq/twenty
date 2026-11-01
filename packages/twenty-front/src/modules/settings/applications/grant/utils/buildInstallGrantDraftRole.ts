import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  materializeRoleManifestObjectPermissions,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// The grant an untouched install creates, as a role the editor can show. Objects that don't
// exist yet (the app's own) can't be shown and are added back when the draft is sent.
export const buildInstallGrantDraftRole = ({
  draftRoleId,
  applicationName,
  requestedRoleManifest,
  objectMetadataItems,
}: {
  draftRoleId: string;
  applicationName: string;
  requestedRoleManifest: RoleManifest;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'universalIdentifier'
  >[];
}): RoleWithPartialMembers => {
  const objectMetadataIdByUniversalIdentifier = new Map(
    objectMetadataItems.map(({ id, universalIdentifier }) => [
      universalIdentifier,
      id,
    ]),
  );

  return {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    id: draftRoleId,
    label: applicationName,
    isEditable: true,
    canReadAllObjectRecords:
      requestedRoleManifest.canReadAllObjectRecords ?? false,
    canUpdateAllObjectRecords:
      requestedRoleManifest.canUpdateAllObjectRecords ?? false,
    canSoftDeleteAllObjectRecords:
      requestedRoleManifest.canSoftDeleteAllObjectRecords ?? false,
    canDestroyAllObjectRecords:
      requestedRoleManifest.canDestroyAllObjectRecords ?? false,
    objectPermissions: (
      materializeRoleManifestObjectPermissions(requestedRoleManifest)
        .objectPermissions ?? []
    ).flatMap(({ objectUniversalIdentifier, ...actions }) => {
      const objectMetadataId = objectMetadataIdByUniversalIdentifier.get(
        objectUniversalIdentifier,
      );

      return isDefined(objectMetadataId)
        ? [
            {
              objectMetadataId,
              canReadObjectRecords: actions.canReadObjectRecords ?? false,
              canUpdateObjectRecords: actions.canUpdateObjectRecords ?? false,
              canSoftDeleteObjectRecords:
                actions.canSoftDeleteObjectRecords ?? false,
              canDestroyObjectRecords: actions.canDestroyObjectRecords ?? false,
            },
          ]
        : [];
    }),
  };
};
