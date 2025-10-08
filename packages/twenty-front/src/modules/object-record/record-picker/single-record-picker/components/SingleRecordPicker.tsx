import { useRef } from 'react';

import {
  SingleRecordPickerMenuItemsWithSearch,
  type SingleRecordPickerMenuItemsWithSearchProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

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

  const setRecordPickerSearchFilter = useSetRecoilComponentState(
    singleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const handleCancel = () => {
    setRecordPickerSearchFilter('');

    onCancel?.();
  };

  const handleMorphItemSelected = (
    selectedMorphItem?: RecordPickerPickableMorphItem | undefined,
  ) => {
    setRecordPickerSearchFilter('');

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
      <DropdownContent ref={containerRef} widthInPixels={dropdownWidth}>
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
      </DropdownContent>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
