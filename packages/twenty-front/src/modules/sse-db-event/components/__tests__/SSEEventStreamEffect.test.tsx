import { act, render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { mockedUserData } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const triggerEventStreamCreation = jest.fn();
const triggerEventStreamDestroy = jest.fn();

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('@/sse-db-event/hooks/useTriggerEventStreamCreation', () => ({
  useTriggerEventStreamCreation: () => ({ triggerEventStreamCreation }),
}));

jest.mock('@/sse-db-event/hooks/useTriggerEventStreamDestroy', () => ({
  useTriggerEventStreamDestroy: () => ({ triggerEventStreamDestroy }),
}));

describe('SSEEventStreamEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('waits for field metadata before creating an event stream', () => {
    const store = createStore();

    store.set(currentUserState.atom, mockedUserData);
    store.set(isMinimalMetadataReadyState.atom, false);
    setTestObjectMetadataItemsInMetadataStore(
      store,
      getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) => ({
        ...objectMetadataItem,
        fields: [],
      })),
    );

    render(
      <Provider store={store}>
        <SSEEventStreamEffect />
      </Provider>,
    );

    expect(triggerEventStreamCreation).not.toHaveBeenCalled();

    act(() => {
      setTestObjectMetadataItemsInMetadataStore(
        store,
        getTestEnrichedObjectMetadataItemsMock(),
      );
      store.set(isMinimalMetadataReadyState.atom, true);
    });

    expect(triggerEventStreamCreation).toHaveBeenCalledTimes(1);
  });
});
