export type PageHealth = {
  id: string;
  name: string;
  isSubscribed: boolean;
  missingWebhookFields: string[];
  isHistoryImported: boolean;
  error: string | null;
};

export type GetPagesHealthResult = {
  pages: PageHealth[];
  canEdit: boolean;
};
