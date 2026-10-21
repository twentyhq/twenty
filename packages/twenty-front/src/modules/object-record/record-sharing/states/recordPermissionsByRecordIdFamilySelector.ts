import { isDefined } from 'twenty-shared/utils';

import { recordPermissionsFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const recordPermissionsByRecordIdFamilySelector =
  createAtomFamilySelector<
    Record<string, RecordPermissionsDto>,
    { objectMetadataId: string; recordIds: string[] }
  >({
    key: 'recordPermissionsByRecordIdFamilySelector',
    get:
      ({ objectMetadataId, recordIds }) =>
      ({ get }) => {
        const permissionsByRecordId: Record<string, RecordPermissionsDto> = {};

        for (const recordId of recordIds) {
          const permissions = get(recordPermissionsFamilySelector, {
            objectMetadataId,
            recordId,
          });

          if (isDefined(permissions)) {
            permissionsByRecordId[recordId] = permissions;
          }
        }

        return permissionsByRecordId;
      },
  });
