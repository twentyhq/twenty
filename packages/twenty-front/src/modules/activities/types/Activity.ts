export type Activity = Record<string, unknown> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  bodyV2?: {
    blocknote: string | null;
    markdown: string | null;
  };
};
