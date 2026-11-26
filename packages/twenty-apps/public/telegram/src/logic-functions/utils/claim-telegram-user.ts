import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTelegramUserKvKey } from 'src/logic-functions/utils/build-telegram-user-kv-key';

export const claimTelegramUser = async ({
  telegramUserId,
  workspaceId,
}: {
  telegramUserId: string;
  workspaceId: string;
}): Promise<boolean> => {
  const key = buildTelegramUserKvKey(telegramUserId);

  try {
    await kv.set(key, null, { scope: 'SERVER' });

    return true;
  } catch (error) {
    const claimingWorkspaceId = await kv.get<string>(key, { scope: 'SERVER' });

    if (
      isNonEmptyString(claimingWorkspaceId) &&
      claimingWorkspaceId !== workspaceId
    ) {
      return false;
    }

    throw error;
  }
};
