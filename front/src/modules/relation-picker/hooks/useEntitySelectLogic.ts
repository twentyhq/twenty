import { useState } from 'react';
import { debounce } from 'lodash';
import scrollIntoView from 'scroll-into-view';

import { useArrowHotkey } from '@/hotkeys/hooks/useArrowHotkey';
import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';

import { relationPickerSearchFilterScopedState } from '../states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '../types/EntityForSelect';

export function useEntitySelectLogic<
  CustomEntityForSelect extends EntityForSelect,
>({
  containerRef,
  entities,
}: {
  entities: CustomEntityForSelect[];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const [searchFilter, setSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const debouncedSetSearchFilter = debounce(setSearchFilter, 100, {
    leading: true,
  });

  function handleSearchFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    debouncedSetSearchFilter(event.currentTarget.value);
    setHoveredIndex(0);
  }

  useArrowHotkey(
    () => {
      setHoveredIndex((prevSelectedIndex) =>
        Math.max(prevSelectedIndex - 1, 0),
      );

      const currentHoveredRef = containerRef.current?.children[
        hoveredIndex
      ] as HTMLElement;

      if (currentHoveredRef) {
        scrollIntoView(currentHoveredRef, {
          align: {
            top: 0.5,
          },
          isScrollable: (target) => {
            return target === containerRef.current;
          },
          time: 0,
        });
      }
    },
    () => {
      setHoveredIndex((prevSelectedIndex) =>
        Math.min(prevSelectedIndex + 1, (entities?.length ?? 0) - 1),
      );

      const currentHoveredRef = containerRef.current?.children[
        hoveredIndex
      ] as HTMLElement;

      if (currentHoveredRef) {
        scrollIntoView(currentHoveredRef, {
          align: {
            top: 0.275,
          },
          isScrollable: (target) => {
            return target === containerRef.current;
          },
          time: 0,
        });
      }
    },
    [setHoveredIndex, entities],
  );

  return {
    hoveredIndex,
    searchFilter,
    handleSearchFilterChange,
  };
}
