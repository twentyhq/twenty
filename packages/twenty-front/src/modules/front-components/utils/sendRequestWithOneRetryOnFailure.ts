import { isDefined } from 'twenty-shared/utils';

import { METADATA_GRAPHQL_OPERATION_RETRY_DELAY_MS } from '@/front-components/constants/MetadataGraphqlOperationRetryDelayMs';
import { sleep } from '~/utils/sleep';

export const sendRequestWithOneRetryOnFailure = async (
  sendRequest: () => Promise<Response>,
): Promise<Response> => {
  const firstResponse = await sendRequest().catch(() => undefined);

  if (isDefined(firstResponse) && firstResponse.status < 500) {
    return firstResponse;
  }

  await sleep(METADATA_GRAPHQL_OPERATION_RETRY_DELAY_MS);

  return sendRequest();
};
