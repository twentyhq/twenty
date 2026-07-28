export type CreateIssueInput = {
  teamId?: string;
  title?: string;
  description?: string;
  priority?: number;
  stateId?: string;
  assigneeId?: string;
  projectId?: string;
  estimate?: number;
  labelIds?: string[];
  cycleId?: string;
  dueDate?: string;
};
