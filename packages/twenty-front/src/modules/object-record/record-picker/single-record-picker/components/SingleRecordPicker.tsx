import { type SingleRecordPickerMenuItemsWithSearchProps } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerMenuItemsWithSearchProps';
import { useRef } from 'react';

import { SingleRecordPickerMenuItemsWithSearch } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const SINGLE_RECORD_PICKER_LISTENER_ID = 'single-record-select';

export type SingleRecordPickerProps = {
  componentInstanceId: string;
  dropdownWidth?: number;
} & SingleRecordPickerMenuItemsWithSearchProps;

export const SingleRecordPicker = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onMorphItemSelected,
  objectNameSingulars,
  componentInstanceId,
  layoutDirection,
  dropdownWidth,
  focusId,
}: SingleRecordPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const handleCancel = () => {
    setSingleRecordPickerSearchFilter('');

    onCancel?.();
  };

  const handleMorphItemSelected = (
    selectedMorphItem?: RecordPickerPickableMorphItem | undefined,
  ) => {
    setSingleRecordPickerSearchFilter('');

    onMorphItemSelected?.(selectedMorphItem);
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const weAreNotInAnHTMLInput = !(
        event.target instanceof HTMLInputElement &&
        event.target.tagName === 'INPUT'
      );

      if (weAreNotInAnHTMLInput) {
        handleCancel();
      }
    },
    listenerId: SINGLE_RECORD_PICKER_LISTENER_ID,
  });

  return (
    <SingleRecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <LegacyDropdownContent ref={containerRef} widthInPixels={dropdownWidth}>
        <SingleRecordPickerMenuItemsWithSearch
          focusId={focusId}
          {...{
            EmptyIcon,
            emptyLabel,
            excludedRecordIds,
            onCancel: handleCancel,
            onCreate,
            onMorphItemSelected: handleMorphItemSelected,
            objectNameSingulars,
            layoutDirection,
          }}
        />
      </LegacyDropdownContent>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
