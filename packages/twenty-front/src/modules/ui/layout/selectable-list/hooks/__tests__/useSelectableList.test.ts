import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'jotai';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const selectableListComponentInstanceId = 'testId';
const testArr = [['1'], ['2'], ['3']];
const emptyArr = [[]];

describe('useSelectableList', () => {
  it('Should setSelectableItemIds', async () => {
    const { result } = renderHook(
      () => {
        const setSelectableItemIds = useSetAtomComponentState(
          selectableItemIdsComponentState,
          selectableListComponentInstanceId,
        );

        const selectableItemIds = useAtomComponentStateValue(
          selectableItemIdsComponentState,
          selectableListComponentInstanceId,
        );

        return {
          setSelectableItemIds,
          selectableItemIds,
        };
      },
      {
        wrapper: Provider,
      },
    );

    expect(result.current.selectableItemIds).toEqual(emptyArr);

    await act(async () => {
      result.current.setSelectableItemIds(testArr);
    });

    expect(result.current.selectableItemIds).toEqual(testArr);
  });

  it('Should resetSelectedItem', async () => {
    const { result } = renderHook(
      () => {
        const { resetSelectedItem } = useSelectableList(
          selectableListComponentInstanceId,
        );

        const selectedItemId = useAtomComponentStateValue(
          selectedItemIdComponentState,
          selectableListComponentInstanceId,
        );
        const setSelectedItemId = useSetAtomComponentState(
          selectedItemIdComponentState,
          selectableListComponentInstanceId,
        );
        return {
          resetSelectedItem,
          selectedItemId,
          setSelectedItemId,
        };
      },
      {
        wrapper: Provider,
      },
    );

    const { selectedItemId, setSelectedItemId } = result.current;

    expect(selectedItemId).toBeNull();

    await act(async () => {
      setSelectedItemId?.('stateForTestValue');
    });

    expect(result.current.selectedItemId).toEqual('stateForTestValue');

    await act(async () => {
      result.current.resetSelectedItem();
    });

    expect(result.current.selectedItemId).toBeNull();
  });
});
