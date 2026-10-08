export type BrowsingContext =
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
    }
  | {
      type: 'validationRule';
      objectMetadataId: string;
      objectNameSingular: string;
      validationRuleId?: string;
    };
