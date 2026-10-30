import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CLAIM_ERROR_CODE_SEARCH_PARAM } from '~/pages/settings/applications/components/SettingsClaimApplicationSection';

type SettingsDevelopersClaimErrorTabEffectProps = {
  tabListId: string;
  appsTabId: string;
};

// The GitHub claim callback returns here with a claim error code, but the URL
// hash that selects the apps tab can be dropped on the way back, so select it
// from the query param instead.
export const SettingsDevelopersClaimErrorTabEffect = ({
  tabListId,
  appsTabId,
}: SettingsDevelopersClaimErrorTabEffectProps) => {
  const [searchParams] = useSearchParams();
  const hasClaimError = searchParams.has(CLAIM_ERROR_CODE_SEARCH_PARAM);

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListId,
  );

  useEffect(() => {
    if (hasClaimError) {
      setActiveTabId(appsTabId);
    }
  }, [hasClaimError, appsTabId, setActiveTabId]);

  return null;
};
