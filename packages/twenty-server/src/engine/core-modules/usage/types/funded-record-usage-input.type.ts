/* @license Enterprise */

import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export type FundedRecordUsageInput = RecordUsageInput & {
  memberCreditsUsedMicro: number;
};
