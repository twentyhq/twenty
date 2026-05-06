export type CreateIssueMutationResult = {
  issueCreate: {
    success: boolean;
    issue: {
      id: string;
      identifier: string;
      title: string;
      url: string;
    } | null;
  };
};
