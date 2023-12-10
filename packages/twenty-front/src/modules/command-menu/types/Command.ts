import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
  Other = 'Other',
}

export type Command = {
  id: string;
  to: string;
  label: string;
  type: CommandType.Navigate | CommandType.Create | CommandType.Other;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  onCommandClick?: () => void;
};
