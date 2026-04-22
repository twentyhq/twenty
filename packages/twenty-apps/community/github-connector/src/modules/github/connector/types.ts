export type GitHubUser = {
  login: string;
  id: number;
};

export type GitHubPullRequest = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  merged: boolean | null;
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  user: GitHubUser;
  merged_by: GitHubUser | null;
};

export type GitHubReview = {
  id: number;
  user: GitHubUser;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  submitted_at: string;
  body: string | null;
};

export type GitHubIssue = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string }>;
  created_at: string;
  closed_at: string | null;
  user: GitHubUser;
  pull_request?: unknown;
};

export type GitHubProjectV2Item = {
  id: number;
  node_id: string;
  project_node_id?: string;
  content_node_id?: string;
  content_type?: 'Issue' | 'PullRequest' | 'DraftIssue';
};

export type GitHubWebhookPayload = {
  action: string;
  pull_request?: GitHubPullRequest;
  review?: GitHubReview;
  issue?: GitHubIssue;
  projects_v2_item?: GitHubProjectV2Item;
  sender: GitHubUser;
  repository?: { full_name: string };
};

export type ProjectV2Item = {
  id: string;
  content: {
    __typename: string;
    title?: string;
    number?: number;
    url?: string;
    repository?: { nameWithOwner: string };
  } | null;
  fieldValues: {
    nodes: Array<ProjectV2FieldValue>;
  };
};

export type ProjectV2FieldValue =
  | { __typename: 'ProjectV2ItemFieldSingleSelectValue'; name: string; field: { name: string } }
  | { __typename: 'ProjectV2ItemFieldIterationValue'; title: string; field: { name: string } }
  | { __typename: 'ProjectV2ItemFieldTextValue'; text: string; field: { name: string } }
  | { __typename: 'ProjectV2ItemFieldNumberValue'; number: number; field: { name: string } }
  | { __typename: 'ProjectV2ItemFieldUserValue'; users: { nodes: Array<{ login: string }> }; field: { name: string } }
  | { __typename: string; field?: { name: string } };
