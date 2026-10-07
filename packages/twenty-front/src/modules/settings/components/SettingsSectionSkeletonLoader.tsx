import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';

type SettingsSectionSkeletonLoaderProps = {
  rowCount?: number;
};

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SettingsSectionSkeletonLoader = ({
  rowCount = 4,
}: SettingsSectionSkeletonLoaderProps) => {
  return (
    <StyledRows>
      {Array.from({ length: rowCount }, (_, index) => (
        <Skeleton key={index} height={32} />
      ))}
    </StyledRows>
  );
};
