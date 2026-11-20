import { Helmet } from '@dr.pogodin/react-helmet';

import { workspaceFaviconUrlSelector } from '@/app/states/workspaceFaviconUrlSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const PageFavicon = () => {
  const workspaceFaviconUrl = useAtomStateValue(workspaceFaviconUrlSelector);

  return (
    <Helmet>
      <link rel="icon" type="image/x-icon" href={workspaceFaviconUrl} />
    </Helmet>
  );
};
