import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
import { IconHome } from 'twenty-ui/icon';

import { AiChatCloseButton } from '@/ai-chat/components/AiChatCloseButton';
import { useInboxPath } from '@/ai-chat/hooks/useInboxPath';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isInboxPath } from '~/utils/isInboxPath';

export const AiChatNewThreadPageActions = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const { getInboxThreadPath } = useInboxPath();

  return (
    <>
      <IconButton
        size="sm"
        variant="outline"
        aria-label={t`Home`}
        nativeButton={false}
        render={<Link to={defaultHomePagePath} />}
      >
        <IconHome />
      </IconButton>
      <AiChatCloseButton
        destinationPath={
          isInboxPath(pathname, inboxRecordRouteObjectNames)
            ? getInboxThreadPath(null)
            : undefined
        }
      />
      <SidePanelToggleButton />
    </>
  );
};
