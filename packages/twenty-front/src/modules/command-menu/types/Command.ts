import { IconComponent } from 'twenty-ui';

export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
  StandardAction = 'StandardAction',
  WorkflowRun = 'WorkflowRun',
}

export type Command = {
  id: string;
  to?: string;
  label: string;
  type:
    | CommandType.Navigate
    | CommandType.Create
    | CommandType.StandardAction
    | CommandType.WorkflowRun;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  onCommandClick?: () => void;
};
