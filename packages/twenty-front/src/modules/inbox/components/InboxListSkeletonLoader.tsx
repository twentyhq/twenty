import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledSkeletonRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSkeletonRowContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const NUMBER_OF_SKELETON_ROWS = 6;

export const InboxListSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {Array.from({ length: NUMBER_OF_SKELETON_ROWS }).map((_, index) => (
          <StyledSkeletonRow key={index}>
            <Skeleton width={24} height={24} borderRadius={4} />
            <StyledSkeletonRowContent>
              <Skeleton height={14} borderRadius={4} />
              <Skeleton height={12} width="60%" borderRadius={4} />
            </StyledSkeletonRowContent>
          </StyledSkeletonRow>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
