export type SesEventBridgeDetailType =
  | 'Sending Status Enabled'
  | 'Sending Status Disabled'
  | 'Email Bounced'
  | 'Email Complaint Received';

type SesEventRecipient = {
  emailAddress: string;
};

type SesMessageEventDetail = {
  eventType?: string;
  mail?: {
    messageId?: string;
    destination?: string[];
    tags?: Record<string, string[]>;
  };
  bounce?: {
    bounceType?: 'Permanent' | 'Transient' | 'Undetermined';
    bouncedRecipients?: SesEventRecipient[];
    feedbackId?: string;
  };
  complaint?: {
    complainedRecipients?: SesEventRecipient[];
    feedbackId?: string;
    complaintFeedbackType?: string;
  };
};

type SesSendingStateEventDetail = {
  version?: string;
  data?: {
    origin?: string;
    record?: {
      status?: 'ENABLED' | 'DISABLED';
      cause?: string;
    };
  };
};

export type SesEventBridgeNotification = {
  source: 'aws.ses';
  'detail-type': SesEventBridgeDetailType;
  resources?: string[];
  detail?: SesMessageEventDetail & SesSendingStateEventDetail;
};
