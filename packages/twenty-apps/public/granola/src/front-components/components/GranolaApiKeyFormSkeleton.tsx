import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSkeletonBlock } from 'src/front-components/components/StyledSkeletonBlock';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledKeyRow = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

export const GranolaApiKeyFormSkeleton = () => (
  <StyledField role="status" aria-label={t('Loading')}>
    <StyledSkeletonBlock $width={48} $height={13} />
    <StyledKeyRow>
      <StyledSkeletonBlock $height={32} />
      <StyledSkeletonBlock $width={76} $height={32} />
    </StyledKeyRow>
  </StyledField>
);
