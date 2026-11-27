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
    | 'ATTACHMENT_REFUSED'
    | 'ANSWERED'
    | 'FEEDBACK_SAVED'
    | 'FEEDBACK_NOT_SAVED'
    | 'STILL_RUNNING'
    | 'FAILED';
};
