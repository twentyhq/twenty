export type SesEventBridgeNotification = {
  source: 'aws.ses';
  'detail-type': 'Sending Status Enabled' | 'Sending Status Disabled';
  resources?: string[];
  detail?: {
    version?: string;
    data?: {
      origin?: string;
      record?: {
        status?: 'ENABLED' | 'DISABLED';
        cause?: string;
      };
    };
  };
};
