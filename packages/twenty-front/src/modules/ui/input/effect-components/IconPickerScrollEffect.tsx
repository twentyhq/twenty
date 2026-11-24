import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ICON_PICKER_DEFAULT_VISIBLE_COUNT } from '@/ui/input/components/constants/IconPickerDefaultVisibleCount';
import { iconPickerVisibleCountState } from '@/ui/input/states/iconPickerVisibleCountState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type IconPickerScrollEffectProps = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  dropdownId: string;
  enabled: boolean;
};

export const IconPickerScrollEffect = ({
  sentinelRef,
  scrollContainerRef,
  dropdownId,
  enabled,
}: IconPickerScrollEffectProps) => {
  const setIconPickerVisibleCount = useSetAtomFamilyState(
    iconPickerVisibleCountState,
    dropdownId,
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!enabled || !isDefined(sentinel) || !isDefined(scrollContainer)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIconPickerVisibleCount(
              (previousCount) =>
                previousCount + ICON_PICKER_DEFAULT_VISIBLE_COUNT,
            );
          }
        }
      },
      { root: scrollContainer, rootMargin: '10px', threshold: 1 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled, sentinelRef, scrollContainerRef, setIconPickerVisibleCount]);

  return null;
};
