import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getCoreAgentRecordAccessLevels = ({
  role,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers | undefined;
  objectMetadataId?: string;
}): CoreAgentRecordAccessLevel[] => {
  const objectPermission = isDefined(objectMetadataId)
    ? role?.objectPermissions?.find(
        (permission) => permission.objectMetadataId === objectMetadataId,
      )
    : undefined;

  return CORE_AGENT_RECORD_ACCESS_LEVELS.filter(
    ({ allRecordsKey, objectKey }) =>
      objectPermission?.[objectKey] ?? role?.[allRecordsKey] ?? false,
  ).map(({ level }) => level);
};
