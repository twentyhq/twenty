import { type ComponentProps } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { MultipleRecordPickerStoryInitializationEffect } from '@/object-record/record-picker/multiple-record-picker/components/__stories__/MultipleRecordPickerStoryInitializationEffect';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type MultipleRecordPickerCreationStoryProps = {
  onCreate: NonNullable<
    ComponentProps<typeof MultipleRecordPicker>['onCreate']
  >;
};

const PICKER_INSTANCE_ID = 'multiple-record-picker-creation-story';

export const MultipleRecordPickerCreationStory = ({
  onCreate,
}: MultipleRecordPickerCreationStoryProps) => {
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }

    openMultipleRecordPicker(PICKER_INSTANCE_ID);
    void performSearch({
      multipleRecordPickerInstanceId: PICKER_INSTANCE_ID,
      forceSearchFilter: '',
    });
  };

  return (
    <>
      <MultipleRecordPickerStoryInitializationEffect
        instanceId={PICKER_INSTANCE_ID}
      />
      <DropdownRoot
        dropdownId={PICKER_INSTANCE_ID}
        type="picker"
        multiple
        defaultPage="records"
        onOpenChange={handleOpenChange}
      >
        <Dropdown.Trigger render={<Button>Link records</Button>} />
        <DropdownContent
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label="Related records"
        >
          <MultipleRecordPicker
            componentInstanceId={PICKER_INSTANCE_ID}
            onCreate={onCreate}
            layoutDirection="search-bar-on-top"
          />
        </DropdownContent>
      </DropdownRoot>
      <Button variant="ghost">Outside picker</Button>
    </>
  );
};
