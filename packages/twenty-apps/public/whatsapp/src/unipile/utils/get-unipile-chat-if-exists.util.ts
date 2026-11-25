import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { UnipileRequestError } from 'src/unipile/utils/request-unipile.util';

const UNIPILE_NOT_FOUND_STATUS = 404;

export const getUnipileChatIfExists = async (
  chat: Parameters<typeof getUnipileChat>[0],
): Promise<UnipileChat | undefined> => {
  try {
    return await getUnipileChat(chat);
  } catch (error) {
    if (
      error instanceof UnipileRequestError &&
      error.status === UNIPILE_NOT_FOUND_STATUS
    ) {
      return undefined;
    }

    throw error;
  }
};
