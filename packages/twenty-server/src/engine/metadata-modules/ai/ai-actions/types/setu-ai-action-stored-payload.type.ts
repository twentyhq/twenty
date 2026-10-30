import {
  type SetuSendEmailActionPayload,
  type SetuUpdateRecordFieldsActionPayload,
} from 'twenty-shared/ai';

export type SetuAiActionStoredPayload =
  | SetuSendEmailActionPayload
  | SetuUpdateRecordFieldsActionPayload;
