import scrollIntoView from 'scroll-into-view';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { CreateButtonId } from '../constants';
import { RelationPickerRecoilScopeContext } from '../states/recoil-scope-contexts/RelationPickerRecoilScopeContext';
import { relationPickerPreselectedIdScopedState } from '../states/relationPickerPreselectedIdScopedState';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';
import { getPreselectedIdIndex } from '../utils/getPreselectedIdIndex';

export const useEntitySelectScroll = ({
  containerRef,
  selectableOptionIds,
}: {
  selectableOptionIds: string[];
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [relationPickerPreselectedId, setRelationPickerPreselectedId] =
    useRecoilScopedState(
      relationPickerPreselectedIdScopedState,
      RelationPickerRecoilScopeContext,
    );

  const preselectedIdIndex = getPreselectedIdIndex(
    selectableOptionIds,
    relationPickerPreselectedId,
  );

  const resetScroll = () => {
    setRelationPickerPreselectedId('');

    const preselectedRef = containerRef.current?.children[0] as HTMLElement;

    scrollIntoView(preselectedRef, {
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
      const previousSelectableIndex = Math.max(preselectedIdIndex - 1, 0);
      const previousSelectableId = selectableOptionIds[previousSelectableIndex];
      setRelationPickerPreselectedId(previousSelectableId);
      const preselectedRef = containerRef.current?.children[
        previousSelectableIndex
      ] as HTMLElement;

      if (preselectedRef) {
        scrollIntoView(preselectedRef, {
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
    [selectableOptionIds],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      const nextSelectableIndex = Math.min(
        preselectedIdIndex + 1,
        selectableOptionIds?.length - 1,
      );
      const nextSelectableId = selectableOptionIds[nextSelectableIndex];
      setRelationPickerPreselectedId(nextSelectableId);
      if (nextSelectableId !== CreateButtonId) {
        const preselectedRef = containerRef.current?.children[
          nextSelectableIndex
        ] as HTMLElement;

        if (preselectedRef) {
          scrollIntoView(preselectedRef, {
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
    [selectableOptionIds],
  );

  return {
    preselectedOptionId: relationPickerPreselectedId,
    resetScroll,
  };
};
