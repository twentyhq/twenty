export type TelegramUpdateHandlerResult = {
  outcome:
    | 'SKIPPED'
    | 'LINKED'
    | 'LINK_EXPIRED'
    | 'LINK_CONFLICT'
    | 'DISCONNECTED'
    | 'NOT_CONNECTED'
    | 'CONNECTED'
    | 'UNSUPPORTED_MESSAGE'
    | 'ATTACHMENT_REFUSED'
    | 'ANSWERED'
    | 'FEEDBACK_SAVED'
    | 'FEEDBACK_NOT_SAVED'
    | 'STILL_RUNNING'
    | 'FAILED';
};
