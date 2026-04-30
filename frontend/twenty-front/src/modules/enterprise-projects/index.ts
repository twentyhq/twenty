// Components
export { ProjectGantt } from './components/ProjectGantt';
export { ProjectList } from './components/ProjectList';
export { TimeTracker } from './components/TimeTracker';

// Hooks
export { GET_ACTIVE_PROJECTS, CREATE_PROJECT_FROM_DEAL, GET_GANTT_DATA, LOG_TIME, GET_PL_BY_PROJECT } from './hooks/useProjects';

// States
export { projectsState, projectsLoadingState, selectedProjectIdState } from './states/projectsStates';

// Types
export type { ProjectHealth, ProjectStatus, ProjectData, GanttTask, TimeEntry } from './types/project.types';
