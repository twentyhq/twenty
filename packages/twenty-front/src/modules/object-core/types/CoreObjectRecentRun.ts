import { type TagColor } from 'twenty-ui/primitives/data-display';

export type CoreObjectRecentRun = {
  id: string;
  createdAt: string;
  statusLabel: string;
  statusColor: TagColor;
};
