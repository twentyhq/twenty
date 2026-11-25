import { isNonEmptyString } from '@sniptt/guards';

import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export const formatTelegramUserName = (
  user: Pick<TelegramUser, 'id' | 'first_name' | 'last_name' | 'username'>,
): string => {
  const fullName = [user.first_name, user.last_name]
    .filter(isNonEmptyString)
    .join(' ');

  if (isNonEmptyString(fullName)) {
    return fullName;
  }

  return isNonEmptyString(user.username) ? `@${user.username}` : `${user.id}`;
};
