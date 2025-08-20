import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

const selectableListComponentInstanceId = 'testId';
const testArr = [['1'], ['2'], ['3']];
const emptyArr = [[]];

describe('useSelectableList', () => {
  it('Should setSelectableItemIds', async () => {
    const { result } = renderHook(
      () => {
        const setSelectableItemIds = useSetRecoilComponentState(
          selectableItemIdsComponentState,
          selectableListComponentInstanceId,
        );

        const selectableItemIds = useRecoilComponentValue(
          selectableItemIdsComponentState,
          selectableListComponentInstanceId,
        );

        return {
          setSelectableItemIds,
          selectableItemIds,
        };
      },
      {
        wrapper: RecoilRoot,
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

        const selectedItemId = useRecoilComponentValue(
          selectedItemIdComponentState,
          selectableListComponentInstanceId,
        );
        const setSelectedItemId = useSetRecoilComponentState(
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
        wrapper: RecoilRoot,
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
