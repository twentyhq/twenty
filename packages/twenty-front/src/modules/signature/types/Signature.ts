export type Signature = {
  id: string;
  attachmentId: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  signatureStatus: string;
  workspaceMemberId: string;
  __typename: 'RabbitSignSignature';
};

export enum SignatureStatus {
  PROCESSING = 'PROCESSING',
  SENT_FOR_SIGNATURE = 'SENT_FOR_SIGNATURE',
  SIGNED = 'SIGNED',
  FAILED = 'FAILED',
}
