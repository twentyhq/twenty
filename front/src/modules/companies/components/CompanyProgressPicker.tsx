import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconChevronDown } from '@/ui/icon';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { useEntitySelectSearch } from '@/ui/input/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export type OwnProps = {
  companyId: string | null;
  onSubmit: (
    newCompanyId: EntityForSelect | null,
    newPipelineStageId: string | null,
  ) => void;
  onCancel?: () => void;
};

export function CompanyProgressPicker({
  companyId,
  onSubmit,
  onCancel,
}: OwnProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const companies = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: companyId ? [companyId] : [],
  });

  const [isProgressSelectionUnfolded, setIsProgressSelectionUnfolded] =
    useState(false);

  const [selectedPipelineStageId, setSelectedPipelineStageId] = useState<
    string | null
  >(null);

  const [currentPipeline] = useRecoilState(currentPipelineState);

  const currentPipelineStages = useMemo(
    () => currentPipeline?.pipelineStages ?? [],
    [currentPipeline],
  );

  function handlePipelineStageChange(newPipelineStageId: string) {
    setSelectedPipelineStageId(newPipelineStageId);
    setIsProgressSelectionUnfolded(false);
  }

  async function handleEntitySelected(
    selectedCompany: EntityForSelect | null | undefined,
  ) {
    onSubmit(selectedCompany ?? null, selectedPipelineStageId);
  }

  useEffect(() => {
    if (currentPipelineStages?.[0]?.id) {
      setSelectedPipelineStageId(currentPipelineStages?.[0]?.id);
    }
  }, [currentPipelineStages]);

  const selectedPipelineStage = useMemo(
    () =>
      currentPipelineStages.find(
        (pipelineStage) => pipelineStage.id === selectedPipelineStageId,
      ),
    [currentPipelineStages, selectedPipelineStageId],
  );

  return (
    <StyledDropdownMenu
      ref={containerRef}
      data-testid={`company-progress-dropdown-menu`}
    >
      {isProgressSelectionUnfolded ? (
        <StyledDropdownMenuItemsContainer>
          {currentPipelineStages.map((pipelineStage, index) => (
            <MenuItem
              key={pipelineStage.id}
              testId={`select-pipeline-stage-${index}`}
              onClick={() => {
                handlePipelineStageChange(pipelineStage.id);
              }}
              text={pipelineStage.name}
            />
          ))}
        </StyledDropdownMenuItemsContainer>
      ) : (
        <>
          <DropdownMenuHeader
            data-testid="selected-pipeline-stage"
            EndIcon={IconChevronDown}
            onClick={() => setIsProgressSelectionUnfolded(true)}
          >
            {selectedPipelineStage?.name}
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <DropdownMenuInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            autoFocus
          />
          <StyledDropdownMenuSeparator />
          <RecoilScope>
            <SingleEntitySelectBase
              onEntitySelected={handleEntitySelected}
              onCancel={onCancel}
              entities={{
                loading: companies.loading,
                entitiesToSelect: companies.entitiesToSelect,
                selectedEntity: companies.selectedEntities[0],
              }}
            />
          </RecoilScope>
        </>
      )}
    </StyledDropdownMenu>
  );
}
