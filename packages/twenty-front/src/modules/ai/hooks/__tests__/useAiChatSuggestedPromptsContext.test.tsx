import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';

import { useAiChatSuggestedPromptsContext } from '@/ai/hooks/useAiChatSuggestedPromptsContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const getObjectMetadataItemId = (nameSingular: string) =>
  objectMetadataItems.find((item) => item.nameSingular === nameSingular)?.id;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const setMainContextStore = ({
  pageType = null,
  viewType = null,
  objectNameSingular,
}: {
  pageType?: ContextStorePageType | null;
  viewType?: ContextStoreViewType | null;
  objectNameSingular?: string;
}) => {
  const instanceId = MAIN_CONTEXT_STORE_INSTANCE_ID;

  jotaiStore.set(
    contextStoreCurrentPageTypeComponentState.atomFamily({
      instanceId,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    pageType,
  );
  jotaiStore.set(
    contextStoreCurrentViewTypeComponentState.atomFamily({
      instanceId,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    viewType,
  );
  jotaiStore.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    objectNameSingular === undefined
      ? undefined
      : getObjectMetadataItemId(objectNameSingular),
  );
};

describe('useAiChatSuggestedPromptsContext', () => {
  beforeEach(() => {
    resetJotaiStore();
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, objectMetadataItems);
  });

  it('should report the record being browsed in the main page', () => {
    setMainContextStore({
      pageType: ContextStorePageType.Record,
      objectNameSingular: 'company',
    });

    const { result } = renderHook(() => useAiChatSuggestedPromptsContext(), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      browsingContextType: 'recordPage',
      objectNameSingular: 'company',
    });
  });

  it('should report a custom object record just like a standard one', () => {
    setMainContextStore({
      pageType: ContextStorePageType.Record,
      objectNameSingular: 'petCareAgreement',
    });

    const { result } = renderHook(() => useAiChatSuggestedPromptsContext(), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      browsingContextType: 'recordPage',
      objectNameSingular: 'petCareAgreement',
    });
  });

  it('should report the list being browsed in the main page', () => {
    setMainContextStore({
      pageType: ContextStorePageType.Index,
      viewType: ContextStoreViewType.Table,
      objectNameSingular: 'workflow',
    });

    const { result } = renderHook(() => useAiChatSuggestedPromptsContext(), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      browsingContextType: 'listView',
      objectNameSingular: 'workflow',
    });
  });

  it('should report nothing when the main page is not about an object', () => {
    setMainContextStore({ pageType: ContextStorePageType.Settings });

    const { result } = renderHook(() => useAiChatSuggestedPromptsContext(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBeNull();
  });
});
