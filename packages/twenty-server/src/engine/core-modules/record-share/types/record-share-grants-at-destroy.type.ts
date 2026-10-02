/* @license Enterprise */

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';

// A destroy deletes the record's shares with it, so its event carries them for the access gate
export type RecordShareGrantsAtDestroyCarrier = {
  recordShareGrantsAtDestroy?: RecordShareGrant[];
};
