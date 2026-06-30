export enum ShortcutType {
  Table = 'Table',
  General = 'General',
}

export type Shortcut = {
  label: string;
  type: ShortcutType.Table | ShortcutType.General;
  firstHotKey?: string;
  secondHotKey?: string;
  areSimultaneous: boolean;
};
