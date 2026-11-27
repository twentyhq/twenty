import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${() => themeCssVariables.background.transparent.light} 0%,
    ${() => themeCssVariables.background.transparent.lighter} 100%
  );
  border-radius: ${() => themeCssVariables.border.radius.md} 0 0
    ${() => themeCssVariables.border.radius.md};
  height: ${() => themeCssVariables.spacing[6]};
  width: 160px;
`;

export const LinkedinSettingsSkeleton = () => (
  <StyledSkeleton aria-busy="true" aria-label={t('Loading')} />
);
