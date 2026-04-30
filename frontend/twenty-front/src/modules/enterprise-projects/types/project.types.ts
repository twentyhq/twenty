export type ProjectHealth = 'on_track' | 'at_risk' | 'off_track';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  owner: string;
  startDate: string;
  endDate: string;
  progressPercent: number;
  budget: number;
  spent: number;
  currency: string;
};

export type GanttTask = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progressPercent: number;
  assignee: string;
};

export type TimeEntry = {
  id: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  hours: number;
  date: string;
  user: string;
};
