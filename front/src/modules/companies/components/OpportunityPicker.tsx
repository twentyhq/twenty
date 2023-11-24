import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { currentPipelineStepsState } from '@/pipeline/states/currentPipelineStepsState';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconChevronDown } from '@/ui/display/icon';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { useEntitySelectSearch } from '@/ui/input/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export type OpportunityPickerProps = {
  companyId: string | null;
  onSubmit: (
    newCompanyId: EntityForSelect | null,
    newPipelineStepId: string | null,
  ) => void;
  onCancel?: () => void;
};

export const OpportunityPicker = ({
  onSubmit,
  onCancel,
}: OpportunityPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const { findManyQuery } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });
  const useFindManyQuery = (options: any) => useQuery(findManyQuery, options);
  const { identifiersMapper, searchQuery } = useRelationPicker();

  const filteredSearchEntityResults = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames: searchQuery?.computeFilterFields?.('company') ?? [],
        filter: searchFilter,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: [],
    mappingFunction: (record: any) => identifiersMapper?.(record, 'company'),
    objectNamePlural: 'companies',
  });

  const [isProgressSelectionUnfolded, setIsProgressSelectionUnfolded] =
    useState(false);

  const [selectedPipelineStepId, setSelectedPipelineStepId] = useState<
    string | null
  >(null);

  const currentPipelineSteps = useRecoilValue(currentPipelineStepsState);

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
            <SingleEntitySelectBase
              entitiesToSelect={filteredSearchEntityResults.entitiesToSelect}
              loading={filteredSearchEntityResults.loading}
              onCancel={onCancel}
              onEntitySelected={handleEntitySelected}
              selectedEntity={filteredSearchEntityResults.selectedEntities[0]}
            />
          </RecoilScope>
        </>
      )}
    </DropdownMenu>
  );
};
