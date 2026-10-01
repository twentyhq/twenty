import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type RecordShareAccessLevel } from '~/generated-metadata/graphql';

export const getRecordShareAccessLevelLabel = (
  accessLevel: RecordShareAccessLevel,
) => {
  const option = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.find(
    (accessLevelOption) => accessLevelOption.value === accessLevel,
  );

  return isDefined(option) ? t(option.label) : undefined;
};
