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
  isPeopleField,
}: {
  isPeopleField: boolean;
}) => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonDiv>
        <Skeleton width={129} height={16} />
        {isPeopleField ? <Skeleton width={129} height={16} /> : null}
      </StyledSkeletonDiv>
    </SkeletonTheme>
  );
};
