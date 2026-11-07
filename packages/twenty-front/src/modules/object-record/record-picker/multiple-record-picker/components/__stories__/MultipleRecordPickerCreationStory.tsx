import { type ComponentProps } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type MultipleRecordPickerCreationStoryProps = {
  componentInstanceId: string;
  onCreate: NonNullable<
    ComponentProps<typeof MultipleRecordPicker>['onCreate']
  >;
};

export const MultipleRecordPickerCreationStory = ({
  componentInstanceId,
  onCreate,
}: MultipleRecordPickerCreationStoryProps) => {
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }

    openMultipleRecordPicker(componentInstanceId);
    void performSearch({
      multipleRecordPickerInstanceId: componentInstanceId,
      forceSearchFilter: '',
    });
  };

  return (
    <>
      <DropdownRoot
        dropdownId={componentInstanceId}
        type="picker"
        multiple
        onOpenChange={handleOpenChange}
      >
        <Dropdown.Trigger render={<Button>Link records</Button>} />
        <DropdownContent
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label="Related records"
        >
          <MultipleRecordPicker
            componentInstanceId={componentInstanceId}
            onCreate={onCreate}
            layoutDirection="search-bar-on-top"
          />
        </DropdownContent>
      </DropdownRoot>
      <Button variant="ghost">Outside picker</Button>
    </>
  );
};
