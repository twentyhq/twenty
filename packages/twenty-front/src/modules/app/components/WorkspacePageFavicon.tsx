import { Helmet } from '@dr.pogodin/react-helmet';
import { isDefined } from 'twenty-shared/utils';

import { FaviconWithUnreadDotEffect } from '@/app/effect-components/FaviconWithUnreadDotEffect';
import { faviconWithUnreadDotUrlFamilyState } from '@/app/states/faviconWithUnreadDotUrlFamilyState';
import { workspaceFaviconUrlSelector } from '@/app/states/workspaceFaviconUrlSelector';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspacePageFavicon = () => {
  const workspaceFaviconUrl = useAtomStateValue(workspaceFaviconUrlSelector);
  const faviconWithUnreadDotUrl = useAtomFamilyStateValue(
    faviconWithUnreadDotUrlFamilyState,
    workspaceFaviconUrl,
  );
  const { hasUnreadOpenThread } = useInboxOpenThreadsSummary();
  const faviconHref =
    hasUnreadOpenThread && isDefined(faviconWithUnreadDotUrl)
      ? faviconWithUnreadDotUrl
      : workspaceFaviconUrl;

  return (
    <>
      <FaviconWithUnreadDotEffect />
      <Helmet>
        <link rel="icon" type="image/x-icon" href={faviconHref} />
      </Helmet>
    </>
  );
};
