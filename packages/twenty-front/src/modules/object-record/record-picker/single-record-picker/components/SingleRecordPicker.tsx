import { useRef } from 'react';

import {
  SingleRecordPickerMenuItemsWithSearch,
  SingleRecordPickerMenuItemsWithSearchProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
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
  onRecordSelected,
  objectNameSingular,
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

  const handleRecordSelected = (
    selectedRecord?: SingleRecordPickerRecord | undefined,
  ) => {
    setRecordPickerSearchFilter('');

    onRecordSelected?.(selectedRecord);
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
            onRecordSelected: handleRecordSelected,
            objectNameSingular,
            layoutDirection,
          }}
        />
      </DropdownContent>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
