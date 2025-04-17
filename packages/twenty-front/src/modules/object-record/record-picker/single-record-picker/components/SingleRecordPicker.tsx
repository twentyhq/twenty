import { useRef } from 'react';

import {
  SingleRecordPickerMenuItemsWithSearch,
  SingleRecordPickerMenuItemsWithSearchProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';

export const SINGLE_RECORD_PICKER_LISTENER_ID = 'single-record-select';

export type SingleRecordPickerProps = {
  componentInstanceId: string;
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
      <DropdownMenu ref={containerRef} data-select-disable>
        <SingleRecordPickerMenuItemsWithSearch
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
      </DropdownMenu>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
