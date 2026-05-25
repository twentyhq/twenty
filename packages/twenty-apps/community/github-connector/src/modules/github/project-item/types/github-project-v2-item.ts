export type GitHubProjectV2Item = {
  id: number;
  node_id: string;
  project_node_id?: string;
  content_node_id?: string;
  content_type?: 'Issue' | 'PullRequest' | 'DraftIssue';
};
