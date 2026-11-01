import { isDefined } from 'twenty-shared/utils';

import { type RecordExportRequester } from 'src/engine/core-modules/record-export/types/record-export-requester.type';

export const isApiKeyRecordExportRequester = (
  requester: RecordExportRequester,
): requester is Extract<RecordExportRequester, { apiKeyId: string }> =>
  isDefined(requester.apiKeyId);
