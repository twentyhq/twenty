import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

const selectableListScopeId = 'testId';
const testArr = [['1'], ['2'], ['3']];
const emptyArr = [[]];

describe('useSelectableList', () => {
  it('Should setSelectableItemIds', async () => {
    const { result } = renderHook(
      () => {
        const setSelectableItemIds = useSetRecoilComponentStateV2(
          selectableItemIdsComponentState,
          selectableListScopeId,
        );

        const selectableItemIds = useRecoilComponentValueV2(
          selectableItemIdsComponentState,
          selectableListScopeId,
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

  it('Should resetSelectItem', async () => {
    const { result } = renderHook(
      () => {
        const { resetSelectedItem } = useSelectableList(selectableListScopeId);

        const selectedItemId = useRecoilComponentValueV2(
          selectedItemIdComponentState,
          selectableListScopeId,
        );
        const setSelectedItemId = useSetRecoilComponentStateV2(
          selectedItemIdComponentState,
          selectableListScopeId,
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
