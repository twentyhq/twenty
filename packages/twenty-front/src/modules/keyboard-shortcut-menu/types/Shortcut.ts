export enum ShortcutType {
  Table = 'Table',
  General = 'General',
  SidePanel = 'SidePanel',
}

export type Shortcut = {
  label: string;
  type: ShortcutType;
  firstHotKey?: string;
  secondHotKey?: string;
  areSimultaneous: boolean;
};
