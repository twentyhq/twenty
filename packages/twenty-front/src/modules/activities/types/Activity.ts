export type Activity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: {
    blocknote: string | null;
    markdown: string | null;
  };
};
