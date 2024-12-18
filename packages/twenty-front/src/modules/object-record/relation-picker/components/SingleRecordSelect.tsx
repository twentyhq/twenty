import { useRef } from 'react';

import {
  SingleRecordSelectMenuItemsWithSearch,
  SingleRecordSelectMenuItemsWithSearchProps,
} from '@/object-record/relation-picker/components/SingleRecordSelectMenuItemsWithSearch';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

export type SingleRecordSelectProps = {
  width?: number;
} & SingleRecordSelectMenuItemsWithSearchProps;

export const SingleRecordSelect = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onRecordSelected,
  objectNameSingular,
  selectedRecordIds,
  width = 200,
}: SingleRecordSelectProps) => {
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
    <DropdownMenu ref={containerRef} width={width} data-select-disable>
      <SingleRecordSelectMenuItemsWithSearch
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
  );
};
