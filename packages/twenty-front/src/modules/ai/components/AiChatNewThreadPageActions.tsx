import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconHome } from 'twenty-ui/icon';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

export const AiChatNewThreadPageActions = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );

  return (
    <>
      <IconButton
        size="sm"
        variant="outline"
        aria-label={t`Home`}
        disabled={isWelcomeAnimationVisible}
        nativeButton={false}
        render={<Link to={defaultHomePagePath} />}
      >
        <IconHome />
      </IconButton>
      <AiChatCloseButton
        destinationPath={
          isAiChatInboxPath(pathname)
            ? getAppPath(AppPath.AiChatInbox, { threadId: null })
            : undefined
        }
      />
      <SidePanelToggleButton />
    </>
  );
};
