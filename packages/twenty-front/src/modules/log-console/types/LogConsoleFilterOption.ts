import { type ReactNode } from 'react';

export type LogConsoleFilterOption = {
  label: string;
  values: string[];
  startIcon?: ReactNode;
  tag?: ReactNode;
};
