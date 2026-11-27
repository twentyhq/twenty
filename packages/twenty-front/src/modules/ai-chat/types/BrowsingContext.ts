import { type SettingsExpressionDraft } from '@/ai-chat/types/SettingsExpressionDraft';

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
      type: 'settingsPage';
      path: string;
      draft?: SettingsExpressionDraft;
    };
