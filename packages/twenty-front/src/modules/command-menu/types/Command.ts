import { IconComponent } from 'twenty-ui';

export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
  Action = 'Action',
}

export type Command = {
  id: string;
  to?: string;
  label: string;
  type: CommandType.Navigate | CommandType.Create | CommandType.Action;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  onCommandClick?: () => void;
};
