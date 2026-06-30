import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';

const mockUseCanPersistViewChanges = jest.fn();
const mockUpsertFieldsWidgetMutation = jest.fn();

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => mockUseCanPersistViewChanges(),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockUpsertFieldsWidgetMutation],
}));

describe('useSaveFieldsWidgetGroups', () => {
  const pageLayoutId = 'page-layout-id';
  const widgetId = 'widget-id';
  const draftGroups = {
    [widgetId]: [
      {
        id: 'group-id',
        name: 'Main',
        position: 0,
        isVisible: true,
        fields: [],
      },
    ],
  };

  const renderUseSaveFieldsWidgetGroups = () => {
    const store = createStore();

    store.set(
      fieldsWidgetGroupsDraftComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      draftGroups as never,
    );
    store.set(
      fieldsWidgetGroupsPersistedComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      {},
    );
    store.set(
      fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      {},
    );
    store.set(
      fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      {},
    );
    store.set(
      fieldsWidgetEditorModeDraftComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      { [widgetId]: 'grouped' },
    );
    store.set(
      fieldsWidgetEditorModePersistedComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      {},
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    return {
      store,
      ...renderHook(() => useSaveFieldsWidgetGroups(), { wrapper }),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCanPersistViewChanges.mockReturnValue({ canPersistChanges: true });
    mockUpsertFieldsWidgetMutation.mockResolvedValue({});
  });

  it('does not persist or mark drafts as persisted when current view changes cannot be persisted', async () => {
    mockUseCanPersistViewChanges.mockReturnValue({ canPersistChanges: false });

    const { result, store } = renderUseSaveFieldsWidgetGroups();

    await act(async () => {
      await result.current.saveFieldsWidgetGroups(pageLayoutId);
    });

    expect(mockUpsertFieldsWidgetMutation).not.toHaveBeenCalled();
    expect(
      store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      ),
    ).toEqual({});
  });

  it('persists and marks drafts as persisted when current view changes can be persisted', async () => {
    const { result, store } = renderUseSaveFieldsWidgetGroups();

    await act(async () => {
      await result.current.saveFieldsWidgetGroups(pageLayoutId);
    });

    expect(mockUpsertFieldsWidgetMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          widgetId,
          groups: [
            {
              id: 'group-id',
              name: 'Main',
              position: 0,
              isVisible: true,
              fields: [],
            },
          ],
        },
      },
    });
    expect(
      store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      ),
    ).toEqual(draftGroups);
  });
});
