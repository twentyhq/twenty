import { useRef } from 'react';

import {
  SingleRecordPickerMenuItemsWithSearch,
  SingleRecordPickerMenuItemsWithSearchProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';

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

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();

      const weAreNotInAnHTMLInput = !(
        event.target instanceof HTMLInputElement &&
        event.target.tagName === 'INPUT'
      );

      if (weAreNotInAnHTMLInput && isDefined(onCancel)) {
        onCancel();
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
            onCancel,
            onCreate,
            onRecordSelected,
            objectNameSingular,
            layoutDirection,
          }}
        />
      </DropdownContent>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
