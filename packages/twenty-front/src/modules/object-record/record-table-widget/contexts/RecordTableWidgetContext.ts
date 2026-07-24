import { createContext } from 'react';

export type RecordTableWidgetContextValue = {
  isPageLayoutInEditMode: boolean;
  pageLayoutId?: string;
  widgetId: string;
};

export const RecordTableWidgetContext =
  createContext<RecordTableWidgetContextValue | null>(null);
