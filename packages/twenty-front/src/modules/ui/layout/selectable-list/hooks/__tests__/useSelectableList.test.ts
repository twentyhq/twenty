import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

const selectableListScopeId = 'testId';
const testArr = [['1'], ['2'], ['3']];
const emptyArr = [[]];

describe('useSelectableList', () => {
  it('Should setSelectableItemIds', async () => {
    const { result } = renderHook(
      () => {
        const { setSelectableItemIds } = useSelectableList(
          selectableListScopeId,
        );

        const { selectableItemIdsState } = useSelectableListStates({
          selectableListScopeId,
        });

        const selectableItemIds = useRecoilValue(selectableItemIdsState);

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

  it('Should resetSelectItem', async () => {
    const { result } = renderHook(
      () => {
        const { resetSelectedItem } = useSelectableList(selectableListScopeId);

        const { selectedItemIdState } = useSelectableListStates({
          selectableListScopeId,
        });

        const [selectedItemId, setSelectedItemId] =
          useRecoilState(selectedItemIdState);

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
