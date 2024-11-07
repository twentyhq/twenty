import { useSetRecoilState } from 'recoil';

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

  const { relationPickerSearchFilterState, relationPickerPreselectedIdState } =
    useRelationPickerScopedStates({
      relationPickerScopedId: scopeId,
    });

  const setRelationPickerSearchFilter = useSetRecoilState(
    relationPickerSearchFilterState,
  );

  const setRelationPickerPreselectedId = useSetRecoilState(
    relationPickerPreselectedIdState,
  );

  return {
    setRelationPickerSearchFilter,
    setRelationPickerPreselectedId,
  };
};
