import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';

const selectableListInstanceId = 'test-selectable-list';

const getSelectedItemId = (store: ReturnType<typeof createStore>) =>
  store.get(
    selectedItemIdComponentState.atomFamily({
      instanceId: selectableListInstanceId,
    }),
  );

const renderSelectableList = ({
  store,
  itemIds,
  shouldPreselectFirstItem,
}: {
  store: ReturnType<typeof createStore>;
  itemIds: string[];
  shouldPreselectFirstItem?: boolean;
}) =>
  render(
    <JotaiProvider store={store}>
      <SelectableList
        selectableListInstanceId={selectableListInstanceId}
        selectableItemIdArray={itemIds}
        focusId="test-focus-id"
        shouldPreselectFirstItem={shouldPreselectFirstItem}
      >
        <div />
      </SelectableList>
    </JotaiProvider>,
  );

describe('SelectableList', () => {
  it('should not select any item when shouldPreselectFirstItem is not set', async () => {
    const store = createStore();

    renderSelectableList({ store, itemIds: ['first-item', 'second-item'] });

    await waitFor(() => {
      expect(getSelectedItemId(store)).toBeNull();
    });
  });

  it('should select the first item when shouldPreselectFirstItem is set', async () => {
    const store = createStore();

    renderSelectableList({
      store,
      itemIds: ['first-item', 'second-item'],
      shouldPreselectFirstItem: true,
    });

    await waitFor(() => {
      expect(getSelectedItemId(store)).toEqual('first-item');
    });
  });

  it('should keep the selected item when it is still in the list', async () => {
    const store = createStore();

    const { rerender } = renderSelectableList({
      store,
      itemIds: ['first-item', 'second-item', 'third-item'],
      shouldPreselectFirstItem: true,
    });

    store.set(
      selectedItemIdComponentState.atomFamily({
        instanceId: selectableListInstanceId,
      }),
      'third-item',
    );

    rerender(
      <JotaiProvider store={store}>
        <SelectableList
          selectableListInstanceId={selectableListInstanceId}
          selectableItemIdArray={['second-item', 'third-item']}
          focusId="test-focus-id"
          shouldPreselectFirstItem
        >
          <div />
        </SelectableList>
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(getSelectedItemId(store)).toEqual('third-item');
    });
  });

  it('should select the first item when the selected item leaves the list', async () => {
    const store = createStore();

    const { rerender } = renderSelectableList({
      store,
      itemIds: ['first-item', 'second-item'],
      shouldPreselectFirstItem: true,
    });

    store.set(
      selectedItemIdComponentState.atomFamily({
        instanceId: selectableListInstanceId,
      }),
      'second-item',
    );

    rerender(
      <JotaiProvider store={store}>
        <SelectableList
          selectableListInstanceId={selectableListInstanceId}
          selectableItemIdArray={['third-item']}
          focusId="test-focus-id"
          shouldPreselectFirstItem
        >
          <div />
        </SelectableList>
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(getSelectedItemId(store)).toEqual('third-item');
    });
  });

  it('should reset the selected item when the list is empty', async () => {
    const store = createStore();

    const { rerender } = renderSelectableList({
      store,
      itemIds: ['first-item'],
      shouldPreselectFirstItem: true,
    });

    await waitFor(() => {
      expect(getSelectedItemId(store)).toEqual('first-item');
    });

    rerender(
      <JotaiProvider store={store}>
        <SelectableList
          selectableListInstanceId={selectableListInstanceId}
          selectableItemIdArray={[]}
          focusId="test-focus-id"
          shouldPreselectFirstItem
        >
          <div />
        </SelectableList>
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(getSelectedItemId(store)).toBeNull();
    });
  });
});
