export type GooglePubsubPushBody = {
  message?: {
    attributes?: Record<string, string | undefined>;
    data?: string;
  };
};
