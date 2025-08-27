import { type IconComponent } from 'twenty-ui/display';
export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
  StandardAction = 'StandardAction',
  WorkflowRun = 'WorkflowRun',
  Fallback = 'Fallback',
}

export enum CommandScope {
  Global = 'Global',
  RecordSelection = 'RecordSelection',
  Object = 'Object',
}

export type Command = {
  id: string;
  to?: string;
  label: string;
  description?: string;
  type?: CommandType;
  scope?: CommandScope;
  Icon?: IconComponent;
  hotKeys?: string[];
  onCommandClick?: () => void;
};
