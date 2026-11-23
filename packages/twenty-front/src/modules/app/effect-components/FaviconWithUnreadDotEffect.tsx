import { useEffect } from 'react';

import { faviconWithUnreadDotUrlFamilyState } from '@/app/states/faviconWithUnreadDotUrlFamilyState';
import { workspaceFaviconUrlSelector } from '@/app/states/workspaceFaviconUrlSelector';
import { drawFaviconWithUnreadDot } from '@/app/utils/drawFaviconWithUnreadDot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { logError } from '~/utils/logError';

export const FaviconWithUnreadDotEffect = () => {
  const workspaceFaviconUrl = useAtomStateValue(workspaceFaviconUrlSelector);
  const setFaviconWithUnreadDotUrl = useSetAtomFamilyState(
    faviconWithUnreadDotUrlFamilyState,
    workspaceFaviconUrl,
  );

  useEffect(() => {
    drawFaviconWithUnreadDot(workspaceFaviconUrl)
      .then((faviconWithUnreadDotUrl) =>
        setFaviconWithUnreadDotUrl(faviconWithUnreadDotUrl),
      )
      .catch(logError);
  }, [workspaceFaviconUrl, setFaviconWithUnreadDotUrl]);

  return null;
};
