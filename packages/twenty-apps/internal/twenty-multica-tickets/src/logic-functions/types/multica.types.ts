export interface MulticaIssue {
  id: string;
  workspace_id: string;
  number: number;
  identifier: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_type: string | null;
  assignee_id: string | null;
  creator_type: string;
  creator_id: string;
  parent_issue_id: string | null;
  project_id: string | null;
  position: number;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  labels: string[];
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  project_id?: string;
  assignee_id?: string;
  parent_issue_id?: string;
  start_date?: string;
  due_date?: string;
  metadata?: Record<string, unknown>;
}

export type CreateIssueResult =
  | { success: true; issue: MulticaIssue }
  | { success: false; error: string };

export type UpdateIssueResult =
  | { success: true; issue: MulticaIssue }
  | { success: false; error: string };
