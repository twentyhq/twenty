import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CLAIM_ERROR_CODE_SEARCH_PARAM } from '~/pages/settings/applications/components/SettingsClaimApplicationSection';

type SettingsApplicationsClaimErrorTabEffectProps = {
  tabListId: string;
  developerTabId: string;
  hasDeveloperAccess: boolean;
};

// The GitHub claim callback returns here with a claim error code, but the URL
// hash that selects the developer tab can be dropped on the way back, so
// select it from the query param instead.
export const SettingsApplicationsClaimErrorTabEffect = ({
  tabListId,
  developerTabId,
  hasDeveloperAccess,
}: SettingsApplicationsClaimErrorTabEffectProps) => {
  const [searchParams] = useSearchParams();
  const hasClaimError = searchParams.has(CLAIM_ERROR_CODE_SEARCH_PARAM);

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListId,
  );

  useEffect(() => {
    if (hasClaimError && hasDeveloperAccess) {
      setActiveTabId(developerTabId);
    }
  }, [hasClaimError, hasDeveloperAccess, developerTabId, setActiveTabId]);

  return null;
};
