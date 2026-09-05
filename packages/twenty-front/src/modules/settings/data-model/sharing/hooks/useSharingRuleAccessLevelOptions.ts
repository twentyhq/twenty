import { useRecordShareAccessLevelOptions } from '@/record-share/hooks/useRecordShareAccessLevelOptions';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const SHARING_RULE_ACCESS_LEVELS = [
  RecordShareAccessLevel.READ,
  RecordShareAccessLevel.READ_WRITE,
];

export const useSharingRuleAccessLevelOptions = () =>
  useRecordShareAccessLevelOptions().filter((option) =>
    SHARING_RULE_ACCESS_LEVELS.includes(option.value),
  );
