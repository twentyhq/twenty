import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { Key } from 'ts-key-enum';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordSelectionArrowKeyNavigation } from '@/object-record/record-selection/hooks/useRecordSelectionArrowKeyNavigation';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'record-index-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecordSelectionComponentInstanceContext.Provider value={{ instanceId }}>
      {children}
    </RecordSelectionComponentInstanceContext.Provider>
  </JotaiProvider>
);

const getSelectedRecordIds = () =>
  jotaiStore.get(
    selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
  );

const pressArrowKey = (
  navigateWithArrowKey: (keyboardEvent: KeyboardEvent) => void,
  key: Key.ArrowUp | Key.ArrowDown,
  shiftKey = false,
) =>
  act(() =>
    navigateWithArrowKey(new KeyboardEvent('keydown', { key, shiftKey })),
  );

const renderArrowKeyNavigation = ({
  activeRecordId,
  container = null,
}: {
  activeRecordId?: string;
  container?: HTMLElement | null;
}) => {
  const onActiveRecordChange = jest.fn();
  const { result } = renderHook(
    () =>
      useRecordSelectionArrowKeyNavigation({
        selectableItemsContainerRef: { current: container },
        activeRecordId,
        onActiveRecordChange,
      }),
    { wrapper: Wrapper },
  );

  return {
    navigateWithArrowKey: (keyboardEvent: KeyboardEvent) =>
      result.current.navigateWithArrowKey(keyboardEvent),
    onActiveRecordChange,
  };
};

const renderSelectableItems = (recordIds: string[]) => {
  const container = document.createElement('div');

  for (const recordId of recordIds) {
    const item = document.createElement('div');

    item.tabIndex = 0;
    item.dataset.selectableId = recordId;
    item.scrollIntoView = jest.fn();
    container.appendChild(item);
  }

  document.body.appendChild(container);

  return container;
};

describe('useRecordSelectionArrowKeyNavigation', () => {
  beforeEach(() => {
    resetJotaiStore();
    document.body.innerHTML = '';
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['a', 'b', 'c', 'd', 'e'],
    );
  });

  it('should move to the record next to the active one', () => {
    const { navigateWithArrowKey, onActiveRecordChange } =
      renderArrowKeyNavigation({ activeRecordId: 'c' });

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown);
    expect(onActiveRecordChange).toHaveBeenLastCalledWith('d');

    pressArrowKey(navigateWithArrowKey, Key.ArrowUp);
    expect(onActiveRecordChange).toHaveBeenLastCalledWith('b');
  });

  it('should start from the first record when none is active', () => {
    const { navigateWithArrowKey, onActiveRecordChange } =
      renderArrowKeyNavigation({});

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown);

    expect(onActiveRecordChange).toHaveBeenCalledWith('a');
  });

  it('should stay on the first record', () => {
    const { navigateWithArrowKey, onActiveRecordChange } =
      renderArrowKeyNavigation({ activeRecordId: 'a' });

    pressArrowKey(navigateWithArrowKey, Key.ArrowUp);

    expect(onActiveRecordChange).not.toHaveBeenCalled();
  });

  it('should extend and shrink the selection from the active record', () => {
    const { navigateWithArrowKey, onActiveRecordChange } =
      renderArrowKeyNavigation({ activeRecordId: 'b' });

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown, true);
    expect(getSelectedRecordIds()).toEqual(['b', 'c']);

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown, true);
    expect(getSelectedRecordIds()).toEqual(['b', 'c', 'd']);

    pressArrowKey(navigateWithArrowKey, Key.ArrowUp, true);
    expect(getSelectedRecordIds()).toEqual(['b', 'c']);

    expect(onActiveRecordChange).not.toHaveBeenCalled();
  });

  it('should clear the selection and move on from its end', () => {
    const { navigateWithArrowKey, onActiveRecordChange } =
      renderArrowKeyNavigation({ activeRecordId: 'a' });

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown, true);
    pressArrowKey(navigateWithArrowKey, Key.ArrowDown, true);
    pressArrowKey(navigateWithArrowKey, Key.ArrowDown);

    expect(getSelectedRecordIds()).toEqual([]);
    expect(onActiveRecordChange).toHaveBeenCalledWith('d');
  });

  it('should move focus between the records on screen', () => {
    const container = renderSelectableItems(['a', 'b', 'd', 'e']);
    const { navigateWithArrowKey } = renderArrowKeyNavigation({ container });
    const getItem = (recordId: string) =>
      container.querySelector(`[data-selectable-id="${recordId}"]`);

    pressArrowKey(navigateWithArrowKey, Key.ArrowDown);
    expect(document.activeElement).toBe(getItem('a'));

    act(() => (getItem('b') as HTMLElement).focus());
    pressArrowKey(navigateWithArrowKey, Key.ArrowDown);
    expect(document.activeElement).toBe(getItem('d'));
  });
});
