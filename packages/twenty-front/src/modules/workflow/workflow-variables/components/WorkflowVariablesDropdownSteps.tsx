import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { searchWorkflowVariables } from '@/workflow/workflow-variables/utils/searchWorkflowVariables';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconX, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownStepsProps = {
  dropdownId: string;
  steps: StepOutputSchemaV2[];
  onSelect: (value: string, path?: string[]) => void;
  onVariableSelect: (value: string, stepId: string) => void;
  shouldDisplaySpecialItems?: boolean;
};

export const WorkflowVariablesDropdownSteps = ({
  dropdownId,
  steps,
  onSelect,
  onVariableSelect,
  shouldDisplaySpecialItems,
}: WorkflowVariablesDropdownStepsProps) => {
  const { getIcon } = useIcons();
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
  });

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
        {matchingVariables.map((variable) => (
          <MenuItemSelect
            key={`${variable.stepId}-${JSON.stringify(variable.path)}-${variable.label}-${variable.isLeaf}`}
            selected={false}
            focused={false}
            onClick={() =>
              variable.isLeaf
                ? onVariableSelect(
                    getVariableTemplateFromPath({
                      stepId: variable.stepId,
                      path: variable.path,
                    }),
                    variable.stepId,
                  )
                : onSelect(variable.stepId, variable.path)
            }
            text={variable.label}
            contextualText={variable.breadcrumb}
            LeftIcon={getIcon(variable.icon)}
            hasSubMenu={!variable.isLeaf}
          />
        ))}
        {matchingVariables.length > 0 && availableSteps.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {availableSteps.map((item) => (
          <MenuItemSelect
            key={`step-${item.id}`}
            selected={false}
            focused={false}
            onClick={() => onSelect(item.id)}
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
