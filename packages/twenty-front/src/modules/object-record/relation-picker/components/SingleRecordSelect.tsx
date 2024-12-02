import { useRef } from 'react';

import {
  SingleRecordSelectMenuItemsWithSearch,
  SingleRecordSelectMenuItemsWithSearchProps,
} from '@/object-record/relation-picker/components/SingleRecordSelectMenuItemsWithSearch';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

export type SingleRecordSelectProps = {
  disableBackgroundBlur?: boolean;
  width?: number;
} & SingleRecordSelectMenuItemsWithSearchProps;

export const SingleRecordSelect = ({
  disableBackgroundBlur = false,
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onRecordSelected,
  objectNameSingular,
  recordPickerInstanceId,
  selectedRecordIds,
  width = 200,
}: SingleRecordSelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useListenClickOutsideV2({
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
    listenerId: 'single-entity-select',
  });

  return (
    <DropdownMenu
      disableBlur={disableBackgroundBlur}
      ref={containerRef}
      width={width}
      data-select-disable
    >
      <SingleRecordSelectMenuItemsWithSearch
        {...{
          EmptyIcon,
          emptyLabel,
          excludedRecordIds,
          onCancel,
          onCreate,
          onRecordSelected,
          objectNameSingular,
          recordPickerInstanceId,
          selectedRecordIds,
        }}
      />
    </DropdownMenu>
  );
};
