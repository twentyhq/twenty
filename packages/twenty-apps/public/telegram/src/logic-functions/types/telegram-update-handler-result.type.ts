export type TelegramUpdateHandlerResult = {
  outcome:
    | 'SKIPPED'
    | 'LINKED'
    | 'LINK_EXPIRED'
    | 'LINK_CONFLICT'
    | 'DISCONNECTED'
    | 'NOT_CONNECTED'
    | 'CONNECTED'
    | 'TEXT_ONLY'
    | 'ANSWERED'
    | 'STILL_RUNNING'
    | 'FAILED';
};
