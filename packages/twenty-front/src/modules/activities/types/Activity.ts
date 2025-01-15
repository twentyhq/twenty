export type Activity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string | null;
  bodyV2?: {
    blocknote: string | null;
    markdown: string | null;
  };
};
