import { type ReactNode } from 'react';

export type CoreAgentListItem = {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  edit?: { label: string; onClick: () => void };
  remove?: { label: string; onClick: () => void };
};
