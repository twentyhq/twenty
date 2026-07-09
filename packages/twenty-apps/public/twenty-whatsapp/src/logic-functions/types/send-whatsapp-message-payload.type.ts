export type SendWhatsappMessagePayload = {
  input: {
    body: string;
    subject: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    html: string;
    attachments?: {
      filename: string;
      contentType: string;
      content: string;
    }[];
    inReplyTo?: string;
    threadExternalId?: string;
    references?: string[];
  };
  connectedAccount: {
    id: string;
    handle: string;
    accessToken: string | null;
  };
};
