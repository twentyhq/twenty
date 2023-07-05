import Skeleton from 'react-loading-skeleton';
import styled from '@emotion/styled';

type OwnProps = {
  count: number;
};

export const SkeletonContainer = styled.div`
  align-items: center;
  display: inline-flex;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  position: relative;
  width: 100%;
`;

export const SkeletonEntityName = styled.div`
  margin-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export function CompanyPickerSkeleton({ count }: OwnProps) {
  const loadSkeletons = Array(count).fill(1);
  return (
    <>
      {loadSkeletons.map((_, i) => (
        <SkeletonContainer key={i}>
          <Skeleton width={15} height={15} />
          <SkeletonEntityName>
            <Skeleton height={8} />
          </SkeletonEntityName>
        </SkeletonContainer>
      ))}
    </>
  );
}
