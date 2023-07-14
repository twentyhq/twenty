import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { GET_PIPELINES } from '@/pipeline-progress/queries';
import { boardColumnsState } from '@/pipeline-progress/states/boardColumnsState';
import { boardItemsState } from '@/pipeline-progress/states/boardItemsState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  Company,
  useCreateOnePipelineProgressMutation,
  useSearchCompanyQuery,
} from '~/generated/graphql';

export function NewCompanyBoardCard() {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    selectedIds: [],
    searchFilter: searchFilter,
    mappingFunction: (company) => ({
      entityType: CommentableType.Company,
      id: company.id,
      name: company.name,
      domainName: company.domainName,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    orderByField: 'name',
    searchOnFields: ['name'],
  });

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardColumnsState);
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const handleEntitySelect = useCallback(async (companyId: string) => {
    return;
  }, []);

  function handleCancel() {
    return;
  }

  return (
    <SingleEntitySelect
      onEntitySelected={(value) => handleEntitySelect(value.id)}
      onCancel={handleCancel}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
        loading: companies.loading,
      }}
    />
  );
}
