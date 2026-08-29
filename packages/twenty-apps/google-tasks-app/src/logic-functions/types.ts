export type taskListsResponse = {
  items: taskList[];
};

type taskList = {
  id: string;
  title: string;
  selfLink: string;
};

export type tasksResponse = {
  items: task[];
};

type task = {
  id: string;
  title: string;
  updated: string;
  deleted: boolean;
  completed?: string;
  notes?: string;
  due?: string;
};
