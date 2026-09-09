export type SlackDeliverMessageResult = {
  delivered: boolean;
  attempt: number;
  rescheduled?: boolean;
  error?: string;
};
