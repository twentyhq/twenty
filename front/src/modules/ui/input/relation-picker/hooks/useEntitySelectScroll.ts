import scrollIntoView from 'scroll-into-view';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { CreateButtonId } from '../constants';
import { RelationPickerRecoilScopeContext } from '../states/recoil-scope-contexts/RelationPickerRecoilScopeContext';
import { relationPickerHoverIdScopedState } from '../states/relationPickerHoverIdScopedState';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export const useEntitySelectScroll = ({
  containerRef,
  hoverIds,
}: {
  hoverIds: string[];
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [relationPickerHoverId, setRelationPickerHoverId] =
    useRecoilScopedState(
      relationPickerHoverIdScopedState,
      RelationPickerRecoilScopeContext,
    );
  const getIndex = hoverIds.findIndex((val) => val === relationPickerHoverId);
  const currentIndex = getIndex === -1 ? 0 : getIndex;
  const nextIndex = Math.min(currentIndex + 1, hoverIds?.length - 1);
  const prevIndex = Math.max(currentIndex - 1, 0);

  const resetScroll = () => {
    setRelationPickerHoverId('');

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
      const prevId = hoverIds[prevIndex];
      setRelationPickerHoverId(prevId);
      const currentHoveredRef = containerRef.current?.children[
        prevIndex
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
    [hoverIds],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      const nextId = hoverIds[nextIndex];
      setRelationPickerHoverId(nextId);
      if (nextId !== CreateButtonId) {
        const currentHoveredRef = containerRef.current?.children[
          nextIndex
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
    [hoverIds],
  );

  return {
    hoveredId: relationPickerHoverId,
    resetScroll,
  };
};
