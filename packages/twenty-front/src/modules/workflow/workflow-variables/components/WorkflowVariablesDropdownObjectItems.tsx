import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';

import { useState } from 'react';
import {
  IconChevronLeft,
  MenuItemSelect,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui';

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
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getIcon } = useIcons();

  const getCurrentSubStep = (): OutputSchema => {
    let currentSubStep = step.outputSchema;

    for (const key of currentPath) {
      if (isRecordOutputSchema(currentSubStep)) {
        currentSubStep = currentSubStep.fields[key]?.value;
      } else if (isBaseOutputSchema(currentSubStep)) {
        currentSubStep = currentSubStep[key]?.value;
      }
    }

    return currentSubStep;
  };

  const getDisplayedSubStepFields = () => {
    const currentSubStep = getCurrentSubStep();

    if (isRecordOutputSchema(currentSubStep)) {
      return currentSubStep.fields;
    } else if (isBaseOutputSchema(currentSubStep)) {
      return currentSubStep;
    }
  };

  const getDisplayedSubStepObject = () => {
    const currentSubStep = getCurrentSubStep();

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    return currentSubStep.object;
  };

  const handleSelectObject = () => {
    const currentSubStep = getCurrentSubStep();

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    onSelect(
      `{{${step.id}.${[...currentPath, currentSubStep.object.fieldIdName].join('.')}}}`,
    );
  };

  const handleSelectField = (key: string) => {
    setCurrentPath([...currentPath, key]);
    setSearchInputValue('');
  };

  const goBack = () => {
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const headerLabel = currentPath.length === 0 ? step.name : currentPath.at(-1);

  const displayedSubStepObject = getDisplayedSubStepObject();

  const shouldDisplaySubStepObject = searchInputValue
    ? displayedSubStepObject?.label &&
      displayedSubStepObject.label
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const displayedFields = getDisplayedSubStepFields();
  const options = displayedFields ? Object.entries(displayedFields) : [];

  const filteredOptions = searchInputValue
    ? options.filter(
        ([_, value]) =>
          value.label &&
          value.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        <OverflowingTextWithTooltip text={headerLabel} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {shouldDisplaySubStepObject && displayedSubStepObject?.label && (
          <MenuItemSelect
            selected={false}
            hovered={false}
            onClick={handleSelectObject}
            text={displayedSubStepObject.label}
            hasSubMenu={false}
            LeftIcon={
              displayedSubStepObject.icon
                ? getIcon(displayedSubStepObject.icon)
                : undefined
            }
          />
        )}
        {filteredOptions.map(([key, value]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            hovered={false}
            onClick={() => handleSelectField(key)}
            text={value.label || key}
            hasSubMenu={!value.isLeaf}
            LeftIcon={value.icon ? getIcon(value.icon) : undefined}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
