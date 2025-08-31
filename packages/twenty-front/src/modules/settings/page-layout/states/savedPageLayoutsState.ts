import { atom } from 'recoil';

export type SavedPageLayout = {
  id: string;
  name: string;
  type: 'DASHBOARD' | 'RECORD_INDEX' | 'RECORD_PAGE';
  createdAt: string;
  updatedAt: string;
  widgets: Array<{
    id: string;
    title: string;
    type: 'VIEW' | 'IFRAME' | 'FIELDS' | 'GRAPH';
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

export const savedPageLayoutsState = atom<SavedPageLayout[]>({
  key: 'savedPageLayoutsState',
  default: [],
});
