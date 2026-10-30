import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { SKELETON_HEIGHT_SIZES, Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

// Mirrors twenty-front's SettingsSectionSkeletonLoader, which the host shows while this component loads
const TITLE_WIDTH = 140;
const LAST_DESCRIPTION_LINE_WIDTH = '60%';
const ROW_COUNT = 5;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[6]};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

export const LinkedinSettingsSkeleton = () => (
  <StyledContainer aria-busy="true" aria-label={t('Loading')}>
    <Skeleton
      layout="block"
      width={TITLE_WIDTH}
      height={SKELETON_HEIGHT_SIZES.s}
    />
    <StyledDescription>
      <Skeleton layout="block" height={SKELETON_HEIGHT_SIZES.xs} />
      <Skeleton
        layout="block"
        width={LAST_DESCRIPTION_LINE_WIDTH}
        height={SKELETON_HEIGHT_SIZES.xs}
      />
    </StyledDescription>
    <StyledRows>
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <Skeleton key={index} layout="block" height={SKELETON_HEIGHT_SIZES.l} />
      ))}
    </StyledRows>
  </StyledContainer>
);
