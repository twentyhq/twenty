import { type WidgetType } from '@/settings/page-layout/mocks/mockWidgets';
import { createState } from 'twenty-ui/utilities';

export enum PageLayoutType {
  DASHBOARD = 'DASHBOARD',
  RECORD_INDEX = 'RECORD_INDEX',
  RECORD_PAGE = 'RECORD_PAGE',
}

export type SavedPageLayout = {
  id: string;
  name: string;
  type: PageLayoutType;
  createdAt: string;
  updatedAt: string;
  widgets: Array<{
    id: string;
    title: string;
    type: WidgetType;
    gridPosition: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
    configuration?: Record<string, unknown>;
    data?: any; // TODO: Remove when backend connected - data will be fetched dynamically
  }>;
};

export const savedPageLayoutsState = createState<SavedPageLayout[]>({
  key: 'savedPageLayoutsState',
  defaultValue: [],
});
