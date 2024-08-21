import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilValue } from 'recoil';

interface UseIsListSelectedItemParams {
  selectableListId: string;
}

export const useIsListSelectedItem = ({
  selectableListId,
}: UseIsListSelectedItemParams) => {
  const { isSelectedItemIdSelector } = useSelectableList(selectableListId);
  const useIsListSelectedItemId = (id: string) =>
    useRecoilValue(isSelectedItemIdSelector(id));
  return useIsListSelectedItemId;
};
