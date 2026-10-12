import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { WorkflowVariableSearchResultItems } from '@/workflow/workflow-variables/components/WorkflowVariableSearchResultItems';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import {
  type WorkflowVariableSelection,
  type WorkflowVariableStepSelection,
} from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { getWorkflowVariableSelectionFromSearchResult } from '@/workflow/workflow-variables/utils/getWorkflowVariableSelectionFromSearchResult';
import { searchWorkflowVariables } from '@/workflow/workflow-variables/utils/searchWorkflowVariables';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowVariablesDropdownStepsProps = {
  steps: StepOutputSchemaV2[];
  onSelect: (selection: WorkflowVariableStepSelection) => void;
  onVariableSelect: (selection: WorkflowVariableSelection) => void;
  shouldDisplaySpecialItems?: boolean;
  shouldDisplayRecordObjects?: boolean;
  objectNameSingularsToSelect?: string[];
};

export const WorkflowVariablesDropdownSteps = ({
  steps,
  onSelect,
  onVariableSelect,
  shouldDisplaySpecialItems,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: WorkflowVariablesDropdownStepsProps) => {
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const [searchInputValue, setSearchInputValue] = useState('');

  const search = searchInputValue.trim().toLowerCase();
  const availableSteps = steps.filter((step) =>
    step.name.toLowerCase().includes(search),
  );
  const matchingVariables = searchWorkflowVariables({
    steps,
    searchInputValue,
    shouldDisplaySpecialItems,
    shouldDisplayRecordObjects,
    objectNameSingularsToSelect,
    objectMetadataItems,
  });

  const handleSearchResultSelect = (variable: WorkflowVariableSearchResult) => {
    if (!variable.isLeaf) {
      onSelect({ stepId: variable.stepId, path: variable.path });
      return;
    }

    onVariableSelect(getWorkflowVariableSelectionFromSearchResult(variable));
  };

  return (
    <>
      <Dropdown.Header>
        <Dropdown.Title>{t`Select Step`}</Dropdown.Title>
        <Dropdown.Close aria-label={t`Close`} />
      </Dropdown.Header>
      <Dropdown.Search
        autoFocus
        placeholder={t`Search steps and fields`}
        aria-label={t`Search steps and fields`}
        value={searchInputValue}
        onValueChange={setSearchInputValue}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        <WorkflowVariableSearchResultItems
          searchResults={matchingVariables}
          onSelect={handleSearchResultSelect}
        />
        {isNonEmptyArray(matchingVariables) &&
          isNonEmptyArray(availableSteps) && <Dropdown.Separator />}
        {availableSteps.map((item) => (
          <Dropdown.OptionItem
            key={`step-${item.id}`}
            onSelect={() => onSelect({ stepId: item.id })}
            hasSubmenu
            closeOnSelect={false}
            startIcon={
              <SelectOptionIcon
                Icon={
                  isNonEmptyString(item.icon) ? getIcon(item.icon) : undefined
                }
              />
            }
          >
            {item.name}
          </Dropdown.OptionItem>
        ))}
        {!isNonEmptyArray(matchingVariables) &&
          !isNonEmptyArray(availableSteps) && (
            <Dropdown.Empty>{t`No variables available`}</Dropdown.Empty>
          )}
      </Dropdown.Section>
    </>
  );
};
