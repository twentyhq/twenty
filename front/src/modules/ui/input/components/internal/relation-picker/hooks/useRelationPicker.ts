import { useRecoilState } from 'recoil';

import { useRelationPickerScopedStates } from '@/ui/input/components/internal/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/ui/input/components/internal/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRelationPickeProps = {
  relationPickerScopeId?: string;
};

export const useRelationPicker = (props?: useRelationPickeProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
    props?.relationPickerScopeId,
  );

  const { identifiersMapperState, searchQueryState } =
    useRelationPickerScopedStates({
      relationPickerScopedId: scopeId,
    });

  const [identifiersMapper, setIdentifiersMapper] = useRecoilState(
    identifiersMapperState,
  );

  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);

  return {
    scopeId,
    identifiersMapper,
    setIdentifiersMapper,
    searchQuery,
    setSearchQuery,
  };
};
