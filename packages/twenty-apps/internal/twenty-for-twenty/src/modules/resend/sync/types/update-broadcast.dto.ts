export type UpdateBroadcastDto = {
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  segmentId?: string | null;
};
