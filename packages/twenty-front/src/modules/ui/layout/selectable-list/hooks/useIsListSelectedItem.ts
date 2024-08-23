import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilCallback } from 'recoil';

interface UseIsListSelectedItemParams {
  selectableListId: string;
}

export const useIsListSelectedItem = ({
  selectableListId,
}: UseIsListSelectedItemParams) => {
  const { isSelectedItemIdSelector } = useSelectableList(selectableListId);

  const isListSelectedItem = useRecoilCallback(
    ({ snapshot }) =>
      (listItemId: string) => {
        return snapshot
          .getLoadable(isSelectedItemIdSelector(listItemId))
          .getValue();
      },
    [isSelectedItemIdSelector],
  );

  return { isListSelectedItem };
};
