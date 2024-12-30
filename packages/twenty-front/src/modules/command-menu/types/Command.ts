import { IconComponent } from 'twenty-ui';
export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
  StandardAction = 'StandardAction',
  WorkflowRun = 'WorkflowRun',
}

export enum CommandScope {
  Global = 'Global',
  RecordSelection = 'RecordSelection',
}

export type Command = {
  id: string;
  to?: string;
  label: string;
  type?: CommandType;
  scope?: CommandScope;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  onCommandClick?: () => void;
  shouldCloseCommandMenuOnClick?: boolean;
};
