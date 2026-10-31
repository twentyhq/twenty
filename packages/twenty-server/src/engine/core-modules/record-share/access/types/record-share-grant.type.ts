/* @license Enterprise */

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';

export type RecordShareGrant = Pick<
  RecordShare,
  'recordId' | 'principalId' | 'accessLevel'
>;
