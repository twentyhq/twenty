import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilCallback } from 'recoil';

interface UseIsListSelectedItemParams {
  selectableListId: string;
}

export const useIsListSelectedItem = ({
  selectableListId,
}: UseIsListSelectedItemParams) => {
  const { isSelectedItemIdSelector } = useSelectableList(selectableListId);

  return useRecoilCallback(
    ({ snapshot }) =>
      (id: string) => {
        const isSelected = snapshot
          .getLoadable(isSelectedItemIdSelector(id))
          .getValue();
        return isSelected;
      },
    [isSelectedItemIdSelector],
  );
};
