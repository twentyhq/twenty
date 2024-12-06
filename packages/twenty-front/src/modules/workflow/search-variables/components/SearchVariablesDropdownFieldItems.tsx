import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import {
  BaseOutputSchema,
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/search-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/search-variables/utils/isRecordOutputSchema';
import { useTheme } from '@emotion/react';

import { useState } from 'react';
import {
  HorizontalSeparator,
  IconChevronLeft,
  MenuItemSelect,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui';

type SearchVariablesDropdownFieldItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const SearchVariablesDropdownFieldItems = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownFieldItemsProps) => {
  const theme = useTheme();
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

  const handleSelectField = (key: string) => {
    const currentSubStep = getCurrentSubStep();
    const handleSelectBaseOutputSchema = (
      baseOutputSchema: BaseOutputSchema,
    ) => {
      if (!baseOutputSchema[key]?.isLeaf) {
        setCurrentPath([...currentPath, key]);
        setSearchInputValue('');
      } else {
        onSelect(`{{${step.id}.${[...currentPath, key].join('.')}}}`);
      }
    };

    if (isRecordOutputSchema(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep.fields);
    } else if (isBaseOutputSchema(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep);
    }
  };

  const goBack = () => {
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const headerLabel = currentPath.length === 0 ? step.name : currentPath.at(-1);
  const displayedObject = getDisplayedSubStepFields();
  const options = displayedObject ? Object.entries(displayedObject) : [];

  const filteredOptions = searchInputValue
    ? options.filter(
        ([_, value]) =>
          value.label &&
          value.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        <OverflowingTextWithTooltip text={headerLabel} />
      </DropdownMenuHeader>
      <HorizontalSeparator
        color={theme.background.transparent.primary}
        noMargin
      />
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <HorizontalSeparator
        color={theme.background.transparent.primary}
        noMargin
      />
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
  );
};
