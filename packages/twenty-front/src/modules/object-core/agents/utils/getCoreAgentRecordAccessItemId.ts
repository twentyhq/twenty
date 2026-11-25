import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';

export const getCoreAgentRecordAccessItemId = ({
  objectMetadataId,
  level,
}: {
  objectMetadataId?: string;
  level: CoreAgentRecordAccessLevel;
}) => `${objectMetadataId ?? 'all-records'}-${level}`;
