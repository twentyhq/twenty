import { type WidgetType } from '@/page-layout/mocks/mockWidgets';
import { createState } from 'twenty-ui/utilities';

export enum PageLayoutType {
  DASHBOARD = 'DASHBOARD',
  RECORD_INDEX = 'RECORD_INDEX',
  RECORD_PAGE = 'RECORD_PAGE',
}

export type GridPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type PageLayoutWidget = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  objectMetadataId?: string | null;
  gridPosition: GridPosition;
  configuration?: Record<string, unknown> | null;
  data?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type PageLayoutTab = {
  id: string;
  title: string;
  position: number;
  pageLayoutId: string;
  widgets: PageLayoutWidget[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type SavedPageLayout = {
  id: string;
  name: string;
  type: PageLayoutType;
  objectMetadataId?: string | null;
  tabs: PageLayoutTab[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export const savedPageLayoutsState = createState<SavedPageLayout[]>({
  key: 'savedPageLayoutsState',
  defaultValue: [],
});
