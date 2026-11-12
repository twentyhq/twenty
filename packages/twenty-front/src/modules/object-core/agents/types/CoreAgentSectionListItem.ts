import { type ReactNode } from 'react';

export type CoreAgentSectionListItem = {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  edit?: { label: string; onClick: () => void };
  remove?: { label: string; onClick: () => void };
};
