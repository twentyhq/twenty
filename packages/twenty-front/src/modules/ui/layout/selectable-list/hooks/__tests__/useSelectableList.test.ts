import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'jotai';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';

const selectableListComponentInstanceId = 'testId';
const testArr = [['1'], ['2'], ['3']];
const emptyArr = [[]];

describe('useSelectableList', () => {
  it('Should setSelectableItemIds', async () => {
    const { result } = renderHook(
      () => {
        const setSelectableItemIds = useSetRecoilComponentStateV2(
          selectableItemIdsComponentState,
          selectableListComponentInstanceId,
        );

        const selectableItemIds = useRecoilComponentValueV2(
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

        const selectedItemId = useRecoilComponentValueV2(
          selectedItemIdComponentState,
          selectableListComponentInstanceId,
        );
        const setSelectedItemId = useSetRecoilComponentStateV2(
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
