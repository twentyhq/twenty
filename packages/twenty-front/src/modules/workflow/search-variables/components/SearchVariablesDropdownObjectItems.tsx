import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import {
  RecordOutputSchema,
  StepOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';

import { useState } from 'react';
import {
  IconChevronLeft,
  MenuItemSelect,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui';

type SearchVariablesDropdownObjectItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const SearchVariablesDropdownObjectItems = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownObjectItemsProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getIcon } = useIcons();
  const recordOutputSchema = step.outputSchema as RecordOutputSchema;

  const handleSelectObject = () => {
    const fieldIdName = recordOutputSchema.object.fieldIdName;
    onSelect(`{{${step.id}.${fieldIdName}}}`);
  };

  const goBack = () => {
    onBack();
  };

  const headerLabel = step.name;

  const currentRecord = recordOutputSchema.object;

  const shouldDisplayCurrentRecord = searchInputValue
    ? currentRecord?.label &&
      currentRecord.label.toLowerCase().includes(searchInputValue.toLowerCase())
    : true;

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        <OverflowingTextWithTooltip text={headerLabel} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      {shouldDisplayCurrentRecord && currentRecord.label && (
        <MenuItemSelect
          selected={false}
          hovered={false}
          onClick={handleSelectObject}
          text={currentRecord.label}
          hasSubMenu={false}
          LeftIcon={
            currentRecord.icon ? getIcon(currentRecord.icon) : undefined
          }
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
