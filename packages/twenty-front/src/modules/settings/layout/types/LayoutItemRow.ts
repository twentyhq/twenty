export type LayoutItemRowSecondary =
  | { kind: 'object'; label: string; icon?: string }
  | { kind: 'type'; label: string };

export type LayoutItemRow = {
  id: string;
  name: string;
  icon?: string;
  applicationId?: string | null;
  secondary?: LayoutItemRowSecondary;
  to?: string;
};
