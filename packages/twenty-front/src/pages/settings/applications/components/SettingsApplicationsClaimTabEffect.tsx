import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CLAIM_ERROR_CODE_SEARCH_PARAM,
  CLAIM_UNIVERSAL_IDENTIFIER_SEARCH_PARAM,
} from '~/pages/settings/applications/components/SettingsClaimApplicationSection';

type SettingsApplicationsClaimTabEffectProps = {
  tabListId: string;
  developerTabId: string;
  hasDeveloperAccess: boolean;
};

// The GitHub claim callback and the CLI ownership error both land here with a
// claim query param, but the URL hash that selects the developer tab can be
// dropped on the way (redirects, login), so select it from the query params.
export const SettingsApplicationsClaimTabEffect = ({
  tabListId,
  developerTabId,
  hasDeveloperAccess,
}: SettingsApplicationsClaimTabEffectProps) => {
  const [searchParams] = useSearchParams();
  const hasClaimParam =
    searchParams.has(CLAIM_ERROR_CODE_SEARCH_PARAM) ||
    searchParams.has(CLAIM_UNIVERSAL_IDENTIFIER_SEARCH_PARAM);

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListId,
  );

  useEffect(() => {
    if (hasClaimParam && hasDeveloperAccess) {
      setActiveTabId(developerTabId);
    }
  }, [hasClaimParam, hasDeveloperAccess, developerTabId, setActiveTabId]);

  return null;
};
