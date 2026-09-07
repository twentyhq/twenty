import { ContextStorePageType } from 'twenty-shared/types';

import { type BrowsingContext } from '@/ai/types/BrowsingContext';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';

export const getAiChatBrowsingContextType = ({
  pageType,
  viewType,
}: {
  pageType: ContextStorePageType | null;
  viewType: ContextStoreViewType | null;
}): BrowsingContext['type'] | null => {
  if (pageType === ContextStorePageType.Record) {
    return 'recordPage';
  }

  if (
    viewType === ContextStoreViewType.Table ||
    viewType === ContextStoreViewType.Kanban
  ) {
    return 'listView';
  }

  return null;
};
