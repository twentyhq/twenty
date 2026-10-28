import { callUnipileApi } from 'src/unipile/utils/call-unipile-api.util';
import { UnipileApiError } from 'src/unipile/utils/unipile-api-error.util';

export const deleteUnipileAccount = async (accountId: string): Promise<void> => {
  try {
    await callUnipileApi<void>({
      method: 'DELETE',
      path: `/accounts/${encodeURIComponent(accountId)}`,
    });
  } catch (error) {
    if (error instanceof UnipileApiError && error.status === 404) {
      return;
    }

    throw error;
  }
};
