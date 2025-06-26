import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { t } from '@lingui/core/macro';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { useVariableDropdown } from '../hooks/useVariableDropdown';

type WorkflowVariablesDropdownObjectItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const WorkflowVariablesDropdownObjectItems = ({
  step,
  onSelect,
  onBack,
}: WorkflowVariablesDropdownObjectItemsProps) => {
  const { getIcon } = useIcons();
  const {
    currentPath,
    filteredOptions,
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
  } = useVariableDropdown({
    step,
    onSelect,
    onBack,
  });

  const getDisplayedSubStepObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    return currentSubStep.object;
  };

  const handleSelectObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    onSelect(
      `{{${step.id}.${[...currentPath, currentSubStep.object.fieldIdName].join('.')}}}`,
    );
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const shouldDisplaySubStepObject = searchInputValue
    ? displayedSubStepObject?.label &&
      displayedSubStepObject.label
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const shouldDisplayObject =
    shouldDisplaySubStepObject && displayedSubStepObject?.label;
  const nameSingular = displayedSubStepObject?.nameSingular;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={goBack}
            Icon={IconChevronLeft}
          />
        }
      >
        <OverflowingTextWithTooltip
          text={getStepHeaderLabel(step, currentPath)}
        />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {shouldDisplayObject && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectObject}
            text={displayedSubStepObject?.label || ''}
            hasSubMenu={false}
            LeftIcon={
              displayedSubStepObject.icon
                ? getIcon(displayedSubStepObject.icon)
                : undefined
            }
            contextualText={t`Pick a ${nameSingular} record`}
          />
        )}
        {filteredOptions.length > 0 && shouldDisplayObject && (
          <DropdownMenuSeparator />
        )}
        {filteredOptions.map(([key, option]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            focused={false}
            onClick={() => handleSelectField(key)}
            text={option.label || key}
            hasSubMenu={!option.isLeaf}
            LeftIcon={option.icon ? getIcon(option.icon) : undefined}
            contextualText={
              option.isLeaf ? option?.value?.toString() : undefined
            }
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
