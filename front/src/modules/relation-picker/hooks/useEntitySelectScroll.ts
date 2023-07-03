import { useState } from 'react';
import scrollIntoView from 'scroll-into-view';

import { useUpDownHotkeys } from '@/hotkeys/hooks/useUpDownHotkeys';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { relationPickerHoverIndexScopedState } from '../states/relationPickerHoverIndexScopedState';
import { EntityForSelect } from '../types/EntityForSelect';

export function useEntitySelectScroll<
  CustomEntityForSelect extends EntityForSelect,
>({
  containerRef,
  entities,
}: {
  entities: CustomEntityForSelect[];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [hoveredIndex, setHoveredIndex] = useRecoilScopedState(
    relationPickerHoverIndexScopedState,
  );

  useUpDownHotkeys(
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
  };
}
