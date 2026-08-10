import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { useExpandSearchToPage } from '@/search/hooks/useExpandSearchToPage';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelExpandSearchButton = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { expandSearchToPage } = useExpandSearchToPage();
  const isSearchPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SEARCH_PAGE_ENABLED,
  );

  const isOnSearchPage = sidePanelPage === SidePanelPages.SearchRecords;

  if (!isSearchPageEnabled || isMobile || !isOnSearchPage) {
    return null;
  }

  return (
    <IconButton
      Icon={IconLayoutSidebarRightExpand}
      size="small"
      variant="tertiary"
      onClick={expandSearchToPage}
      ariaLabel={t`Expand search`}
    />
  );
};
