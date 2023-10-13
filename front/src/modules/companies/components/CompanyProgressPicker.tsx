import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { IconChevronDown } from '@/ui/Display/Icon';
import { SingleEntitySelectBase } from '@/ui/Input/Relation Picker/components/SingleEntitySelectBase';
import { useEntitySelectSearch } from '@/ui/Input/Relation Picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/ui/Input/Relation Picker/types/EntityForSelect';
import { DropdownMenuHeader } from '@/ui/Layout/Dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/Layout/Dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/Layout/Dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/Layout/Dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/Layout/Dropdown/components/StyledDropdownMenuSeparator';
import { MenuItem } from '@/ui/Navigation/Menu Item/components/MenuItem';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export type CompanyProgressPickerProps = {
  companyId: string | null;
  onSubmit: (
    newCompanyId: EntityForSelect | null,
    newPipelineStageId: string | null,
  ) => void;
  onCancel?: () => void;
};

export const CompanyProgressPicker = ({
  companyId,
  onSubmit,
  onCancel,
}: CompanyProgressPickerProps) => {
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

  const handlePipelineStageChange = (newPipelineStageId: string) => {
    setSelectedPipelineStageId(newPipelineStageId);
    setIsProgressSelectionUnfolded(false);
  };

  const handleEntitySelected = async (
    selectedCompany: EntityForSelect | null | undefined,
  ) => {
    onSubmit(selectedCompany ?? null, selectedPipelineStageId);
  };

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
        <DropdownMenuItemsContainer>
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
        </DropdownMenuItemsContainer>
      ) : (
        <>
          <DropdownMenuHeader
            testId="selected-pipeline-stage"
            EndIcon={IconChevronDown}
            onClick={() => setIsProgressSelectionUnfolded(true)}
          >
            {selectedPipelineStage?.name}
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            autoFocus
          />
          <StyledDropdownMenuSeparator />
          <RecoilScope>
            <SingleEntitySelectBase
              entitiesToSelect={companies.entitiesToSelect}
              loading={companies.loading}
              onCancel={onCancel}
              onEntitySelected={handleEntitySelected}
              selectedEntity={companies.selectedEntities[0]}
            />
          </RecoilScope>
        </>
      )}
    </StyledDropdownMenu>
  );
};
