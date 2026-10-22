export type AccountGroupAction = {
  action: 'disconnect' | 'delete';
  handle: string;
  targets: { id: string; label: string }[];
};
