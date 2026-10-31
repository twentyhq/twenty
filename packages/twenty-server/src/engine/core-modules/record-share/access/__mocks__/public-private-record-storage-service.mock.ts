/* @license Enterprise */

import { type PrivateRecordStorageService } from 'src/engine/core-modules/record-share/access/services/private-record-storage.service';

// Every record it is asked about exists and is public
export const PUBLIC_PRIVATE_RECORD_STORAGE_SERVICE_MOCK: Pick<
  PrivateRecordStorageService,
  'findStates'
> = {
  findStates: async ({ recordIds }) =>
    new Map(
      recordIds.map((recordId) => [
        recordId,
        { isPrivate: false, createdByWorkspaceMemberId: null },
      ]),
    ),
};
