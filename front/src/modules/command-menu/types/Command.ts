import { IconComponent } from '@/ui/icon/types/IconComponent';

export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
}

export type Command = {
  to: string;
  label: string;
  type: CommandType.Navigate | CommandType.Create;
  Icon?: IconComponent;
  iconProps?: { size?: number };
  shortcuts?: string[];
  onCommandClick?: () => void;
};
