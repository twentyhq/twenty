// What a model (or a reviewer's edit) may supply. Everything else in a
// revision is resolved by the server.
export type SetuSendEmailActionInput = {
  to: string[] | string;
  cc?: string[] | string;
  bcc?: string[] | string;
  subject: string;
  body: string;
  connectedAccountId?: string;
};

export type SetuUpdateRecordFieldsActionInput = {
  objectNameSingular: string;
  recordId: string;
  fields: Record<string, unknown>;
};

export type SetuAiActionProposalInput =
  | { kind: 'send_email'; sendEmail: SetuSendEmailActionInput }
  | {
      kind: 'update_record_fields';
      updateRecordFields: SetuUpdateRecordFieldsActionInput;
    };
