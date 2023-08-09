export enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
}

export type Command = {
  to: string;
  label: string;
  type: CommandType.Navigate | CommandType.Create;
  icon?: JSX.Element;
  shortcuts?: string[];
  onCommandClick?: () => void;
};
