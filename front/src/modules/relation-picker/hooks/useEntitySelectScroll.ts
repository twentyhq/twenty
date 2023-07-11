import scrollIntoView from 'scroll-into-view';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
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

  function resetScroll() {
    setHoveredIndex(0);

    const currentHoveredRef = containerRef.current?.children[0] as HTMLElement;

    scrollIntoView(currentHoveredRef, {
      align: {
        top: 0,
      },
      isScrollable: (target) => {
        return target === containerRef.current;
      },
      time: 0,
    });
  }

  useScopedHotkeys(
    Key.ArrowUp,
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
    InternalHotkeysScope.RelationPicker,
    [setHoveredIndex, entities],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      setHoveredIndex((prevSelectedIndex) =>
        Math.min(prevSelectedIndex + 1, (entities?.length ?? 0) - 1),
      );

      const currentHoveredRef = containerRef.current?.children[
        hoveredIndex
      ] as HTMLElement;

      if (currentHoveredRef) {
        console.log({ currentHoveredRef, containerRef });
        scrollIntoView(currentHoveredRef, {
          align: {
            top: 0.15,
          },
          isScrollable: (target) => {
            return target === containerRef.current;
          },
          time: 0,
        });
      }
    },
    InternalHotkeysScope.RelationPicker,
    [setHoveredIndex, entities],
  );

  return {
    hoveredIndex,
    resetScroll,
  };
}
