import { Navigate } from 'react-router-dom';

import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { SearchPageContent } from '@/search/components/SearchPageContent';
import { ExpandedPagePanel } from '@/ui/layout/page/components/ExpandedPagePanel';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SearchPage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isSearchPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SEARCH_PAGE_ENABLED,
  );

  if (!isSearchPageEnabled) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return (
    <ExpandedPagePanel>
      <SearchPageContent />
    </ExpandedPagePanel>
  );
};
