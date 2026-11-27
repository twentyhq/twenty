import { useLocation } from 'react-router-dom';

import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';
import { isCoreAgentPath } from '~/utils/isCoreAgentPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const useIsLayoutCustomizationAllowedOnCurrentPage = () => {
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );

  return (
    !isAiModePath(pathname, inboxRecordRouteObjectNames) &&
    !isSettingsPath(pathname) &&
    !isCoreAgentPath(pathname)
  );
};
