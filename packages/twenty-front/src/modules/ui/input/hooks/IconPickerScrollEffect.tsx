import { useEffect } from 'react';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { iconPickerVisibleCountState } from '../states/iconPickerVisibleCountState';
import { useSetRecoilState } from 'recoil';

type IconPickerScrollEffectProps = {
  sentinelId: string;
  dropdownId: string;
};

export const IconPickerScrollEffect = ({
  sentinelId,
  dropdownId,
}: IconPickerScrollEffectProps) => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const setVisibleCount = useSetRecoilState(
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
            setVisibleCount((prev) => prev + 25);
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
  }, [sentinelId, scrollWrapperHTMLElement, setVisibleCount]);

  return null;
};
