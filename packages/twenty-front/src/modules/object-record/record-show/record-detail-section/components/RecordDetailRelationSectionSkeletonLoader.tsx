import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 40px;
`;

export const RecordDetailRelationSectionSkeletonLoader = ({
  numSkeletons = 1,
}: {
  numSkeletons?: number;
}) => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonDiv>
        {Array.from({ length: numSkeletons }).map((_, index) => (
          <Skeleton key={index} width={129} height={16} />
        ))}
      </StyledSkeletonDiv>
    </SkeletonTheme>
  );
};
