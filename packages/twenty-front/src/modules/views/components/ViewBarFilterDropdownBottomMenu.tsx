import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';
import { ViewBarFilterDropdownAnyFieldSearchButton } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchButton';
import { ViewBarFilterDropdownVectorSearchButton } from '@/views/components/ViewBarFilterDropdownVectorSearchButton';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  const isAnyFieldSearchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ANY_FIELD_SEARCH_ENABLED,
  );

  return (
    <StyledContainer>
      {isAnyFieldSearchEnabled ? (
        <ViewBarFilterDropdownAnyFieldSearchButton />
      ) : (
        <ViewBarFilterDropdownVectorSearchButton />
      )}
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
