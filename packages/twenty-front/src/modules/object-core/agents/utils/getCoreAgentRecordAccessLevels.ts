import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getCoreAgentRecordAccessLevels = ({
  role,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers | undefined;
  objectMetadataId?: string;
}): CoreAgentRecordAccessLevel[] => {
  if (!isDefined(role)) {
    return [];
  }

  const operations = getObjectOperations({ role, objectMetadataId });

  return CORE_AGENT_RECORD_ACCESS_LEVELS.filter(({ objectKey }) =>
    operations.includes(objectKey),
  ).map(({ level }) => level);
};
