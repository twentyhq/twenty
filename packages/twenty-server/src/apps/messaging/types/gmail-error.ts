export type GmailError = {
  code: number;
  errors: {
    domain: string;
    reason: string;
    message: string;
    locationType?: string;
    location?: string;
  }[];
  message: string;
};
