import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { iconPickerVisibleCountState } from '@/ui/input/states/iconPickerVisibleCountState';

type IconPickerScrollEffectProps = {
  sentinelId: string;
  dropdownId: string;
};

export const IconPickerScrollEffect = ({
  sentinelId,
  dropdownId,
}: IconPickerScrollEffectProps) => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const setIconPickerVisibleCount = useSetRecoilState(
    iconPickerVisibleCountState(dropdownId),
  );

  useEffect(() => {
    const element = document.querySelector(
      `#${sentinelId}`,
    ) as HTMLElement | null;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIconPickerVisibleCount((previousCount) => previousCount + 25);
          }
        });
      },
      {
        root: scrollWrapperHTMLElement,
        rootMargin: '10px',
        threshold: 1.0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [sentinelId, scrollWrapperHTMLElement, setIconPickerVisibleCount]);

  return null;
};
