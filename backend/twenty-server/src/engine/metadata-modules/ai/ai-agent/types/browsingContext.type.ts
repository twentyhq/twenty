export type BrowsingContextType =
  | {
      type: 'recordPage';
      objectNameSingular: string;
      recordId: string;
      pageLayoutId?: string;
      activeTabId?: string | null;
    }
  | {
      type: 'listView';
      objectNameSingular: string;
      viewId: string;
      viewName: string;
      filterDescriptions: string[];
    };
