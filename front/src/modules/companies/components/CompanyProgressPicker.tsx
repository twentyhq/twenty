import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { useEntitySelectSearch } from '@/ui/input/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
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

  const theme = useTheme();

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

  const selectedPipelineStage = currentPipelineStages.find(
    (pipelineStage) => pipelineStage.id === selectedPipelineStageId,
  );

  return (
    <DropdownMenu
      ref={containerRef}
      data-testid={`company-progress-dropdown-menu`}
    >
      {isProgressSelectionUnfolded ? (
        <>
          <DropdownMenuItemsContainer>
            {currentPipelineStages.map((pipelineStage, index) => (
              <DropdownMenuItem
                key={pipelineStage.id}
                data-testid={`select-pipeline-stage-${index}`}
                onClick={() => {
                  handlePipelineStageChange(pipelineStage.id);
                }}
              >
                {pipelineStage.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuItemsContainer>
        </>
      ) : (
        <>
          <DropdownMenuHeader
            data-testid="selected-pipeline-stage"
            endIcon={<IconChevronDown size={theme.icon.size.md} />}
            onClick={() => setIsProgressSelectionUnfolded(true)}
          >
            {selectedPipelineStage?.name}
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            autoFocus
          />
          <DropdownMenuSeparator />
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
    </DropdownMenu>
  );
}
