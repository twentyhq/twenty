import { useCallback, useRef, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { usePreviousHotkeyScope } from '@/lib/hotkeys/hooks/usePreviousHotkeyScope';
import { GET_PIPELINES } from '@/pipeline-progress/queries';
import { BoardColumnContext } from '@/pipeline-progress/states/BoardColumnContext';
import { boardState } from '@/pipeline-progress/states/boardState';
import { pipelineStageIdScopedState } from '@/pipeline-progress/states/pipelineStageIdScopedState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { NewButton } from '@/ui/board/components/NewButton';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
  useSearchCompanyQuery,
} from '~/generated/graphql';
import { currentPipelineState } from '~/pages/opportunities/currentPipelineState';

export function NewCompanyProgressButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardState);
  const [pipeline] = useRecoilState(currentPipelineState);
  const [pipelineStageId] = useRecoilScopedState(
    pipelineStageIdScopedState,
    BoardColumnContext,
  );

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const handleEntitySelect = useCallback(
    async (company: any) => {
      if (!company) return;

      setIsCreatingCard(false);
      goBackToPreviousHotkeyScope();

      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: BoardPipelineStageColumn) =>
          column.pipelineStageId === pipelineStageId,
      );
      newBoard[destinationColumnIndex].pipelineProgressIds.push(newUuid);
      setBoard(newBoard);
      await createOnePipelineProgress({
        variables: {
          uuid: newUuid,
          pipelineStageId: pipelineStageId || '',
          pipelineId: pipeline?.id || '',
          entityId: company.id || '',
          entityType: PipelineProgressableType.Company,
        },
      });
    },
    [
      goBackToPreviousHotkeyScope,
      board,
      setBoard,
      createOnePipelineProgress,
      pipelineStageId,
      pipeline?.id,
    ],
  );

  const handleNewClick = useCallback(() => {
    setIsCreatingCard(true);
    setHotkeyScopeAndMemorizePreviousScope(
      RelationPickerHotkeyScope.RelationPicker,
    );
  }, [setIsCreatingCard, setHotkeyScopeAndMemorizePreviousScope]);

  function handleCancel() {
    goBackToPreviousHotkeyScope();
    setIsCreatingCard(false);
  }

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

  return (
    <>
      {isCreatingCard && (
        <RecoilScope>
          <div ref={containerRef}>
            <div ref={containerRef}>
              <SingleEntitySelect
                onEntitySelected={(value) => handleEntitySelect(value)}
                onCancel={handleCancel}
                entities={{
                  entitiesToSelect: companies.entitiesToSelect,
                  selectedEntity: companies.selectedEntities[0],
                  loading: companies.loading,
                }}
              />
            </div>
          </div>
        </RecoilScope>
      )}
      <NewButton onClick={handleNewClick} />
    </>
  );
}
