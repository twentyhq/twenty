import { RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS } from 'src/logic-functions/constants/recall-bot-noone-joined-timeout-seconds';
import { RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS } from 'src/logic-functions/constants/recall-bot-waiting-room-timeout-seconds';

export const RECALL_BOT_AUTOMATIC_LEAVE = {
  waiting_room_timeout: RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS,
  noone_joined_timeout: RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS,
};
