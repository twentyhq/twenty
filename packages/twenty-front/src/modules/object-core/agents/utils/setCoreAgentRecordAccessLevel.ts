import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/utils/getRoleWithUpsertedObjectPermission';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export const setCoreAgentRecordAccessLevel = ({
  role,
  level,
  isEnabled,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers;
  level: CoreAgentRecordAccessLevel;
  isEnabled: boolean;
  objectMetadataId?: string;
}): RoleWithPartialMembers => {
  const changedLevels = CORE_AGENT_RECORD_ACCESS_LEVELS.filter(
    (levelConfig) =>
      levelConfig.level === level ||
      (isEnabled && levelConfig.level === 'see') ||
      (!isEnabled && level === 'see'),
  );

  if (!isDefined(objectMetadataId)) {
    const nextRole = { ...role };

    for (const { allRecordsKey } of changedLevels) {
      nextRole[allRecordsKey] = isEnabled;
    }

    return nextRole;
  }

  const nextObjectPermission: ObjectPermission = {
    ...role.objectPermissions?.find(
      (permission) => permission.objectMetadataId === objectMetadataId,
    ),
    objectMetadataId,
  };

  for (const { objectKey } of changedLevels) {
    nextObjectPermission[objectKey] = isEnabled;
  }

  return getRoleWithUpsertedObjectPermission(role, nextObjectPermission);
};
