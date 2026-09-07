import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutScrollResetEffectProps = {
  pageLayoutTabId?: string | null;
  scrollWrapperInstanceId: string;
  targetRecordId?: string | null;
};

export const PageLayoutScrollResetEffect = ({
  pageLayoutTabId,
  scrollWrapperInstanceId,
  targetRecordId,
}: PageLayoutScrollResetEffectProps) => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    scrollWrapperInstanceId,
  );

  useEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollWrapperElement.scrollTop = 0;
    }
  }, [getScrollWrapperElement, pageLayoutTabId, targetRecordId]);

  return null;
};
