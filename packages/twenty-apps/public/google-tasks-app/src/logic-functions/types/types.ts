export type TaskListsResponse = {
  items?: TaskList[];
  nextPageToken?: string;
};

type TaskList = {
  id: string;
};

export type TasksResponse = {
  items?: GoogleTask[];
  nextPageToken?: string;
};

export type GoogleTask = {
  id: string;
  title: string;
  updated: string;
  deleted?: boolean;
  completed?: string;
  notes?: string;
  due?: string;
};

export type GoogleTaskPayload = {
  title: string;
  notes: string;
  due: string | null;
  status: 'needsAction' | 'completed';
};

export type TaskNode = {
  id: string;
  title?: string;
  bodyV2?: {
    markdown?: string;
  };
  deletedAt?: string | null;
  dueAt?: string | null;
  status?: string | null;
  googleTasksId?: string | null;
  googleTasksListId?: string | null;
};

export type TaskFields = {
  title?: string;
  bodyV2?: { markdown: string | null };
  dueAt?: string | null;
  status?: 'TODO' | 'DONE';
  googleTasksListId?: string;
};

export type TaskUpdate = {
  id: string;
  fields: TaskFields;
};

export type TasksSyncPlan = {
  tasksToCreate: GoogleTask[];
  tasksToUpdate: TaskUpdate[];
};

export type PushTasksResult = {
  hasFailures: boolean;
};
