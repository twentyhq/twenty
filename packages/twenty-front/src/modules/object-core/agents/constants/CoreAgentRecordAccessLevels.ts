import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type Role } from '~/generated-metadata/graphql';

export const CORE_AGENT_RECORD_ACCESS_LEVELS = [
  {
    level: 'see',
    allRecordsKey: 'canReadAllObjectRecords',
    objectKey: 'canReadObjectRecords',
    label: msg`See`,
    allRecordsLabel: msg`See all records`,
  },
  {
    level: 'edit',
    allRecordsKey: 'canUpdateAllObjectRecords',
    objectKey: 'canUpdateObjectRecords',
    label: msg`Edit`,
    allRecordsLabel: msg`Edit all records`,
  },
  {
    level: 'delete',
    allRecordsKey: 'canSoftDeleteAllObjectRecords',
    objectKey: 'canSoftDeleteObjectRecords',
    label: msg`Delete`,
    allRecordsLabel: msg`Delete all records`,
  },
  {
    level: 'destroy',
    allRecordsKey: 'canDestroyAllObjectRecords',
    objectKey: 'canDestroyObjectRecords',
    label: msg`Destroy`,
    allRecordsLabel: msg`Destroy all records`,
  },
] as const satisfies readonly {
  level: string;
  allRecordsKey: keyof Pick<
    Role,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  objectKey: SettingsRoleObjectPermissionKey;
  label: MessageDescriptor;
  allRecordsLabel: MessageDescriptor;
}[];
