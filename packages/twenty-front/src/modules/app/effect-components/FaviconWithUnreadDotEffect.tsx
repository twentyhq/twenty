import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { faviconWithUnreadDotState } from '@/app/states/faviconWithUnreadDotState';
import { drawFaviconWithUnreadDot } from '@/app/utils/drawFaviconWithUnreadDot';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { logError } from '~/utils/logError';

type FaviconWithUnreadDotEffectProps = {
  faviconUrl: string;
};

export const FaviconWithUnreadDotEffect = ({
  faviconUrl,
}: FaviconWithUnreadDotEffectProps) => {
  const setFaviconWithUnreadDot = useSetAtomState(faviconWithUnreadDotState);

  useEffect(() => {
    let isStale = false;

    drawFaviconWithUnreadDot(faviconUrl)
      .then((href) => {
        if (!isStale && isDefined(href)) {
          setFaviconWithUnreadDot({ faviconUrl, href });
        }
      })
      .catch(logError);

    return () => {
      isStale = true;
    };
  }, [faviconUrl, setFaviconWithUnreadDot]);

  return null;
};
