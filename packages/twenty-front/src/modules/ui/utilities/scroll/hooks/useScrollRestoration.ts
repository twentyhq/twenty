import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

const CONTENT_RENDER_DELAY = 50;
const FLAG_RESET_DELAY = 100;

export const useScrollRestoration = (componentInstanceId: string) => {
  const location = useLocation();
  const storageKey = `scroll-${location.pathname}`;
  const [isRestoring, setIsRestoring] = useState(false);

  const { scrollWrapperHTMLElement } =
    useScrollWrapperElement(componentInstanceId);

  const scrollTop = useRecoilComponentValueV2(
    scrollWrapperScrollTopComponentState,
    componentInstanceId,
  );

  useEffect(() => {
    if (scrollTop > 0 && !isRestoring) {
      sessionStorage.setItem(storageKey, scrollTop.toString());
    }
  }, [scrollTop, storageKey, isRestoring]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    if (isDefined(savedPosition)) {
      const position = parseInt(savedPosition, 10);

      setIsRestoring(true);

      setTimeout(() => {
        if (isDefined(scrollWrapperHTMLElement)) {
          scrollWrapperHTMLElement.scrollTo({ top: position });
        }

        setTimeout(() => {
          setIsRestoring(false);
        }, FLAG_RESET_DELAY);
      }, CONTENT_RENDER_DELAY);
    }
  }, [location.pathname, storageKey, scrollWrapperHTMLElement]);
};
