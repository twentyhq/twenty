import scrollIntoView from 'scroll-into-view';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { relationPickerHoverIndexScopedState } from '../states/relationPickerHoverIndexScopedState';
import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export function useEntitySelectScroll<
  CustomEntityForSelect extends EntityForSelect,
>({
  containerRef,
  entities,
}: {
  entities: CustomEntityForSelect[];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [relationPickerHoverIndex, setRelationPickerHoverIndex] =
    useRecoilScopedState(relationPickerHoverIndexScopedState);

  function resetScroll() {
    setRelationPickerHoverIndex(0);

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
      setRelationPickerHoverIndex((prevSelectedIndex) =>
        Math.max(prevSelectedIndex - 1, 0),
      );

      const currentHoveredRef = containerRef.current?.children[
        relationPickerHoverIndex
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
    RelationPickerHotkeyScope.RelationPicker,
    [setRelationPickerHoverIndex, entities],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      setRelationPickerHoverIndex((prevSelectedIndex) =>
        Math.min(prevSelectedIndex + 1, (entities?.length ?? 0) - 1),
      );

      const currentHoveredRef = containerRef.current?.children[
        relationPickerHoverIndex
      ] as HTMLElement;

      if (currentHoveredRef) {
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
    RelationPickerHotkeyScope.RelationPicker,
    [setRelationPickerHoverIndex, entities],
  );

  return {
    relationPickerHoverIndex,
    resetScroll,
  };
}
