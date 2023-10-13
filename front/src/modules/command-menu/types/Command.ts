import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';

export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
}

export type Command = {
  to: string;
  label: string;
  type: CommandType.Navigate | CommandType.Create;
  Icon?: IconComponent;
  shortcuts?: string[];
  onCommandClick?: () => void;
};
