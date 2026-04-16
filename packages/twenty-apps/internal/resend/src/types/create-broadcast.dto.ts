export type CreateBroadcastDto = {
  name: string;
  subject: string | null;
  fromAddress: string | string[] | null;
  replyTo: string | string[];
  previewText: string;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  segmentId?: string;
};
