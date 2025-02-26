import { useRef } from 'react';

import {
  SingleRecordPickerMenuItemsWithSearch,
  SingleRecordPickerMenuItemsWithSearchProps,
} from '@/object-record/record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared';

export type SingleRecordPickerProps = {
  width?: number;
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
  selectedRecordIds,
  width = 200,
  componentInstanceId,
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
    listenerId: 'single-record-select',
  });

  return (
    <RecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <DropdownMenu ref={containerRef} width={width} data-select-disable>
        <SingleRecordPickerMenuItemsWithSearch
          {...{
            EmptyIcon,
            emptyLabel,
            excludedRecordIds,
            onCancel,
            onCreate,
            onRecordSelected,
            objectNameSingular,
            selectedRecordIds,
          }}
        />
      </DropdownMenu>
    </RecordPickerComponentInstanceContext.Provider>
  );
};
