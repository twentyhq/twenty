import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsSectionSkeletonLoaderProps = {
  rowCount?: number;
};

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const SettingsSectionSkeletonLoader = ({
  rowCount = 4,
}: SettingsSectionSkeletonLoaderProps) => {
  return (
    <StyledRows>
      {Array.from({ length: rowCount }, (_, index) => (
        <Skeleton key={index} height={SKELETON_HEIGHT_SIZES.l} />
      ))}
    </StyledRows>
  );
};
