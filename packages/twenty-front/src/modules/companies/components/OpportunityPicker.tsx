import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SingleEntitySelectMenuItemsWithSearch } from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { currentPipelineStepsState } from '@/pipeline/states/currentPipelineStepsState';
import { IconChevronDown } from '@/ui/display/icon';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

export type OpportunityPickerProps = {
  companyId: string | null;
  onSubmit: (
    newCompany: EntityForSelect | null,
    newPipelineStepId: string | null,
  ) => void;
  onCancel?: () => void;
};

export const OpportunityPicker = ({
  onSubmit,
  onCancel,
}: OpportunityPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
          <SingleEntitySelectMenuItemsWithSearch
            onCancel={onCancel}
            onEntitySelected={handleEntitySelected}
            relationObjectNameSingular={CoreObjectNameSingular.Company}
            selectedRelationRecordIds={[]}
          />
        </>
      )}
    </DropdownMenu>
  );
};
