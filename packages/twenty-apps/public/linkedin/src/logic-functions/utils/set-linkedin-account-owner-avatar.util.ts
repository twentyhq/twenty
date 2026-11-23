import { isNonEmptyString } from '@sniptt/guards';

import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { setMissingLinkedinPersonAvatars } from 'src/logic-functions/utils/set-missing-linkedin-person-avatars.util';
import { getUnipileUser } from 'src/unipile/utils/get-unipile-user.util';

export const setLinkedinAccountOwnerAvatar = async ({
  unipileAccountId,
  channelHandle,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  channelHandle: string;
  deadlineAtMs: number;
}): Promise<void> => {
  try {
    const personIds = await findPersonIdsByLinkedinHandle(channelHandle);

    if (personIds.length === 0) {
      return;
    }

    const profile = await getUnipileUser({
      accountId: unipileAccountId,
      userId: 'me',
    });
    const pictureUrl = profile.public_picture_url;

    if (!isNonEmptyString(pictureUrl)) {
      return;
    }

    await setMissingLinkedinPersonAvatars({
      avatars: personIds.map((personId) => ({ personId, pictureUrl })),
      deadlineAtMs,
    });
  } catch (error) {
    console.warn(
      `[linkedin] could not set the avatar of the account owner: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
