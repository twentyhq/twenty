import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { IconChevronDown } from '@/ui/display/icon';
import { useEntitySelectSearch } from '@/ui/input/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export type CompanyProgressPickerProps = {
  companyId: string | null;
  onSubmit: (
    newCompanyId: EntityForSelect | null,
    newPipelineStepId: string | null,
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

  // const companies = useFilteredSearchCompanyQuery({
  //   searchFilter,
  //   selectedIds: companyId ? [companyId] : [],
  // });

  const [isProgressSelectionUnfolded, setIsProgressSelectionUnfolded] =
    useState(false);

  const [selectedPipelineStepId, setSelectedPipelineStepId] = useState<
    string | null
  >(null);

  const [currentPipeline] = useRecoilState(currentPipelineState);

  const currentPipelineSteps = useMemo(
    () => currentPipeline?.pipelineSteps ?? [],
    [currentPipeline],
  );

  const handlePipelineStepChange = (newPipelineStepId: string) => {
    setSelectedPipelineStepId(newPipelineStepId);
    setIsProgressSelectionUnfolded(false);
  };

  const handleEntitySelected = async (
    selectedCompany: EntityForSelect | null | undefined,
  ) => {
    onSubmit(selectedCompany ?? null, selectedPipelineStepId);
  };

  useEffect(() => {
    if (currentPipelineSteps?.[0]?.id) {
      setSelectedPipelineStepId(currentPipelineSteps?.[0]?.id);
    }
  }, [currentPipelineSteps]);

  const selectedPipelineStep = useMemo(
    () =>
      currentPipelineSteps.find(
        (pipelineStep: any) => pipelineStep.id === selectedPipelineStepId,
      ),
    [currentPipelineSteps, selectedPipelineStepId],
  );

  return (
    <DropdownMenu
      ref={containerRef}
      data-testid={`company-progress-dropdown-menu`}
    >
      {isProgressSelectionUnfolded ? (
        <DropdownMenuItemsContainer>
          {currentPipelineSteps.map((pipelineStep: any, index: number) => (
            <MenuItem
              key={pipelineStep.id}
              testId={`select-pipeline-stage-${index}`}
              onClick={() => {
                handlePipelineStepChange(pipelineStep.id);
              }}
              text={pipelineStep.name}
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
            {selectedPipelineStep?.name}
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            autoFocus
          />
          <DropdownMenuSeparator />
          <RecoilScope>
            {/* <SingleEntitySelectBase
              entitiesToSelect={companies.entitiesToSelect}
              loading={companies.loading}
              onCancel={onCancel}
              onEntitySelected={handleEntitySelected}
              selectedEntity={companies.selectedEntities[0]}
            /> */}
          </RecoilScope>
        </>
      )}
    </DropdownMenu>
  );
};
