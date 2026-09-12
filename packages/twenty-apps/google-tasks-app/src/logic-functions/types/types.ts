export type TaskListsResponse = {
  items?: TaskList[];
};

type TaskList = {
  id: string;
  title: string;
  selfLink: string;
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

export type TaskNode = {
  id: string;
  title?: string;
  bodyV2?: {
    markdown?: string;
  }
  deletedAt?: string | null;
  dueAt?: string | null;
  status?: string | null;
  googleTasksId?: string | null;
}

export type TaskFields = {
  title?: string;
  bodyV2?: { markdown: string | null };
  dueAt?: string | null;
  status?: 'TODO' | 'DONE';
};

export type TaskUpdate = {
  id: string;
  fields: TaskFields;
};

// No delete bucket by design: a task removed in Google stays in the CRM as the
// last known state.
export type TasksSyncPlan = {
  tasksToCreate: GoogleTask[];
  tasksToUpdate: TaskUpdate[];
};
