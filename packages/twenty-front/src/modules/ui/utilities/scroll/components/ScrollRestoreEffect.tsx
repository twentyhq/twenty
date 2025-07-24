import { useScrollToElement } from '@/ui/utilities/scroll/hooks/useScrollToElement';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { RecoilState, useRecoilState } from 'recoil';

type ScrollRestoreEffectProps = {
  lastVisitedItemState: RecoilState<string | null>;
  idPrefix: string;
};

export const ScrollRestoreEffect = ({
  lastVisitedItemState,
  idPrefix,
}: ScrollRestoreEffectProps) => {
    const [lastVisitedItem, setLastVisitedItem] = useRecoilState(lastVisitedItemState);
    const { scrollToElement } = useScrollToElement();
  
    useEffect(() => {
      if (!isNonEmptyString(lastVisitedItem)) {
        return;
      }
  
      const elementId = `${idPrefix}-${lastVisitedItem}`;
      
      if (scrollToElement(elementId)) {
        setLastVisitedItem(null);
      }
    }, [lastVisitedItem, setLastVisitedItem, scrollToElement, idPrefix]);
  return <></>;
}; 