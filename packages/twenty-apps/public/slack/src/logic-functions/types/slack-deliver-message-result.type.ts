export type SlackDeliverMessageResult = {
  delivered: boolean;
  attempt: number;
  rescheduled?: boolean;
  statusRecorded?: boolean;
  error?: string;
};
