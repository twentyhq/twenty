import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { useLingui } from '@lingui/react/macro';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { useVariableDropdown } from '../hooks/useVariableDropdown';

type WorkflowVariablesDropdownAllItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
  shouldEnableSelectRelationObject?: boolean;
};

export const WorkflowVariablesDropdownAllItems = ({
  step,
  onSelect,
  onBack,
  shouldEnableSelectRelationObject,
}: WorkflowVariablesDropdownAllItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const {
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    filteredOptions,
    currentPath,
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

    const isRelationField = currentSubStep.object.isRelationField ?? false;
    const isRelationObjectSelectable =
      shouldEnableSelectRelationObject ?? false;

    if (isRelationField && isRelationObjectSelectable) {
      onSelect(
        getVariableTemplateFromPath({
          stepId: step.id,
          path: currentPath,
        }),
      );
    } else {
      onSelect(
        getVariableTemplateFromPath({
          stepId: step.id,
          path: [...currentPath, currentSubStep.object.fieldIdName],
        }),
      );
    }
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
        {filteredOptions.map(([key, subStep]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            focused={false}
            onClick={() => handleSelectField(key)}
            text={subStep.label || key}
            hasSubMenu={!subStep.isLeaf}
            LeftIcon={subStep.icon ? getIcon(subStep.icon) : undefined}
            contextualText={
              subStep.isLeaf ? subStep?.value?.toString() : undefined
            }
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
