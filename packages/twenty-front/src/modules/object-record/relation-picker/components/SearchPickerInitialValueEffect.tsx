import { getRelationPickerScopedStates } from '@/object-record/relation-picker/utils/getRelationPickerScopedStates';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const SearchPickerInitialValueEffect = ({
  initialValueForSearchFilter,
  relationPickerScopeId,
}: {
  initialValueForSearchFilter?: string | null;
  relationPickerScopeId: string;
}) => {
  const { relationPickerSearchFilterState } = getRelationPickerScopedStates({
    relationPickerScopeId: relationPickerScopeId,
  });

  const setRelationPickerSearchFilter = useSetRecoilState(
    relationPickerSearchFilterState,
  );

  useEffect(() => {
    setRelationPickerSearchFilter(initialValueForSearchFilter ?? '');
  }, [initialValueForSearchFilter, setRelationPickerSearchFilter]);

  return <></>;
};
