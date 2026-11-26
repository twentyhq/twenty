import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_DISCONNECT_COMMAND } from 'src/logic-functions/constants/telegram-disconnect-command';
import { type TelegramInboundEvent } from 'src/logic-functions/types/telegram-inbound-event.type';
import { type TelegramUpdate } from 'src/logic-functions/types/telegram-update.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

const PRIVATE_CHAT_TYPE = 'private';
const BLOCKED_MEMBER_STATUS = 'kicked';
const START_WITH_TOKEN_PATTERN = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{1,64})$/;
const COMMAND_PATTERN = /^(\/\w+)(?:@\w+)?(?:\s|$)/;

const isHumanSender = (user: TelegramUser | undefined): user is TelegramUser =>
  isDefined(user) && isNumber(user.id) && !user.is_bot;

export const parseTelegramUpdate = (
  update: TelegramUpdate | null | undefined,
): TelegramInboundEvent | undefined => {
  const blockedBy = update?.my_chat_member;

  if (
    blockedBy?.chat?.type === PRIVATE_CHAT_TYPE &&
    blockedBy.new_chat_member?.status === BLOCKED_MEMBER_STATUS &&
    isHumanSender(blockedBy.from)
  ) {
    return { kind: 'BLOCKED', user: blockedBy.from };
  }

  const message = update?.message;

  if (
    message?.chat?.type !== PRIVATE_CHAT_TYPE ||
    !isNumber(message.chat.id) ||
    !isHumanSender(message.from)
  ) {
    return undefined;
  }

  const sender = { chatId: message.chat.id, user: message.from };
  const text = message.text?.trim() ?? '';
  const token = START_WITH_TOKEN_PATTERN.exec(text)?.[1];

  if (isDefined(token)) {
    return { kind: 'LINK_START', ...sender, token };
  }

  if (COMMAND_PATTERN.exec(text)?.[1] === TELEGRAM_DISCONNECT_COMMAND) {
    return { kind: 'DISCONNECT', ...sender };
  }

  return {
    kind: 'MESSAGE',
    ...sender,
    messageId: message.message_id,
    text,
  };
};
