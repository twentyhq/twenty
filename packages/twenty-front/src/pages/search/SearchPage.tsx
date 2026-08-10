import { styled } from '@linaria/react';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { SearchPageContent } from '@/search/components/SearchPageContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE = `calc(${themeCssVariables.border.radius.md} + ${themeCssVariables.spacing[1]})`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE} 0 0
    ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

export const SearchPage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isSearchPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SEARCH_PAGE_ENABLED,
  );

  if (!isSearchPageEnabled) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return (
    <StyledPanel>
      <SearchPageContent />
    </StyledPanel>
  );
};
