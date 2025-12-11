export type BrowsingContext =
  | {
      type: 'recordPage';
      objectNameSingular: string;
      recordId: string;
    }
  | {
      type: 'listView';
      objectNameSingular: string;
      viewId: string;
      viewName: string;
      filterDescriptions: string[];
    };
