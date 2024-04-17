import { useRef } from 'react';

import {
  SingleEntitySelectMenuItemsWithSearch,
  SingleEntitySelectMenuItemsWithSearchProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

export type SingleEntitySelectProps = {
  disableBackgroundBlur?: boolean;
  width?: number;
} & SingleEntitySelectMenuItemsWithSearchProps;

export const SingleEntitySelect = ({
  disableBackgroundBlur = false,
  EmptyIcon,
  emptyLabel,
  excludedRelationRecordIds,
  onCancel,
  onCreate,
  onEntitySelected,
  relationObjectNameSingular,
  relationPickerScopeId,
  selectedEntity,
  selectedRelationRecordIds,
  width = 200,
}: SingleEntitySelectProps) => {
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
  });

  return (
    <DropdownMenu
      disableBlur={disableBackgroundBlur}
      ref={containerRef}
      width={width}
      data-select-disable
    >
      <SingleEntitySelectMenuItemsWithSearch
        {...{
          EmptyIcon,
          emptyLabel,
          excludedRelationRecordIds,
          onCancel,
          onCreate,
          onEntitySelected,
          relationObjectNameSingular,
          relationPickerScopeId,
          selectedEntity,
          selectedRelationRecordIds,
        }}
      />
    </DropdownMenu>
  );
};
