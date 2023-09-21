import scrollIntoView from 'scroll-into-view';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { CreateButtonId } from '../constants';
import { RelationPickerRecoilScopeContext } from '../states/recoil-scope-contexts/RelationPickerRecoilScopeContext';
import { relationPickerHoveredIdScopedState } from '../states/relationPickerHoveredIdScopedState';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';
import { getHoveredIdIndex } from '../utils/getHoveredIdIndex';

export const useEntitySelectScroll = ({
  containerRef,
  hoveredIds,
}: {
  hoveredIds: string[];
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [relationPickerHoveredId, setRelationPickerHoveredId] =
    useRecoilScopedState(
      relationPickerHoveredIdScopedState,
      RelationPickerRecoilScopeContext,
    );

  const currentHoveredIdIndex = getHoveredIdIndex(
    hoveredIds,
    relationPickerHoveredId,
  );

  const resetScroll = () => {
    setRelationPickerHoveredId('');

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
  };

  useScopedHotkeys(
    Key.ArrowUp,
    () => {
      const previousHoverableIdIndex = Math.max(currentHoveredIdIndex - 1, 0);
      const previousHoverableId = hoveredIds[previousHoverableIdIndex];
      setRelationPickerHoveredId(previousHoverableId);
      const currentHoveredRef = containerRef.current?.children[
        previousHoverableIdIndex
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
    [hoveredIds],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      const nextHoverableIdIndex = Math.min(
        currentHoveredIdIndex + 1,
        hoveredIds?.length - 1,
      );
      const nextHoverableId = hoveredIds[nextHoverableIdIndex];
      setRelationPickerHoveredId(nextHoverableId);
      if (nextHoverableId !== CreateButtonId) {
        const currentHoveredRef = containerRef.current?.children[
          nextHoverableIdIndex
        ] as HTMLElement;

        if (currentHoveredRef) {
          scrollIntoView(currentHoveredRef, {
            align: {
              top: 0.15,
            },
            isScrollable: (target) => target === containerRef.current,
            time: 0,
          });
        }
      }
    },
    RelationPickerHotkeyScope.RelationPicker,
    [hoveredIds],
  );

  return {
    hoveredId: relationPickerHoveredId,
    resetScroll,
  };
};
