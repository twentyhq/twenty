export type TelegramUpdateHandlerResult = {
  outcome:
    | 'SKIPPED'
    | 'LINKED'
    | 'LINK_EXPIRED'
    | 'LINK_CONFLICT'
    | 'DISCONNECTED'
    | 'NOT_CONNECTED'
    | 'CONNECTED';
};
