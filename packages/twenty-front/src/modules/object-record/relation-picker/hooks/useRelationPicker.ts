import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRelationPickeProps = {
  relationPickerScopeId?: string;
};

export const useRelationPicker = (props?: useRelationPickeProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
    props?.relationPickerScopeId,
  );

  const {
    searchQueryState,
    relationPickerSearchFilterState,
    relationPickerPreselectedIdState,
  } = useRelationPickerScopedStates({
    relationPickerScopedId: scopeId,
  });

  const setSearchQuery = useSetRecoilState(searchQueryState);

  const setRelationPickerSearchFilter = useSetRecoilState(
    relationPickerSearchFilterState,
  );

  const relationPickerSearchFilter = useRecoilValue(
    relationPickerSearchFilterState,
  );

  const [relationPickerPreselectedId, setRelationPickerPreselectedId] =
    useRecoilState(relationPickerPreselectedIdState);

  return {
    scopeId,
    setSearchQuery,
    setRelationPickerSearchFilter,
    relationPickerPreselectedId,
    setRelationPickerPreselectedId,
    relationPickerSearchFilter,
  };
};
