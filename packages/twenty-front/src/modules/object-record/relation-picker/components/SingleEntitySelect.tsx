import { useRef } from 'react';

import {
  SingleEntitySelectMenuItemsWithSearch,
  SingleEntitySelectMenuItemsWithSearchProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

export type SingleEntitySelectProps = {
  disableBackgroundBlur?: boolean;
  width?: number;
} & SingleEntitySelectMenuItemsWithSearchProps;

export const SingleEntitySelect = ({
  EmptyIcon,
  disableBackgroundBlur = false,
  emptyLabel,
  entitiesToSelect,
  loading,
  onCancel,
  onCreate,
  onEntitySelected,
  selectedEntity,
  width = 200,
}: SingleEntitySelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();

      onCancel?.();
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
          entitiesToSelect,
          loading,
          onCancel,
          onCreate,
          onEntitySelected,
          selectedEntity,
        }}
      />
    </DropdownMenu>
  );
};
