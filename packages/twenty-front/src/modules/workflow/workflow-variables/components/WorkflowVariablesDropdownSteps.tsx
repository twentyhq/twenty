import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
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
import { useState } from 'react';
import { IconX, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownStepsProps = {
  dropdownId: string;
  steps: StepOutputSchemaV2[];
  onSelect: (selection: WorkflowVariableStepSelection) => void;
  onVariableSelect: (selection: WorkflowVariableSelection) => void;
  shouldDisplaySpecialItems?: boolean;
  shouldDisplayRecordObjects?: boolean;
  objectNameSingularsToSelect?: string[];
};

export const WorkflowVariablesDropdownSteps = ({
  dropdownId,
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

  const { closeDropdown } = useCloseDropdown();

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
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => closeDropdown(dropdownId)}
            Icon={IconX}
          />
        }
      >
        <OverflowingTextWithTooltip text={t`Select Step`} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        placeholder={t`Search steps and fields`}
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <WorkflowVariableSearchResultItems
          searchResults={matchingVariables}
          onSelect={handleSearchResultSelect}
        />
        {matchingVariables.length > 0 && availableSteps.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {availableSteps.map((item) => (
          <MenuItemSelect
            key={`step-${item.id}`}
            selected={false}
            focused={false}
            onClick={() => onSelect({ stepId: item.id })}
            text={item.name}
            LeftIcon={item.icon ? getIcon(item.icon) : undefined}
            hasSubMenu
          />
        ))}
        {matchingVariables.length === 0 && availableSteps.length === 0 && (
          <MenuItem
            key="no-steps"
            onClick={() => {}}
            text={t`No variables available`}
            LeftIcon={undefined}
            hasSubMenu={false}
          />
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
