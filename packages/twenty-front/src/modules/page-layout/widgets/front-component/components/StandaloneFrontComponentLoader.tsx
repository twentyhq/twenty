import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;

  @container tab-viewport (min-height: 0px) {
    min-height: calc(100cqh - ${themeCssVariables.spacing[4]});
  }
`;

export const StandaloneFrontComponentLoader = () => (
  <StyledContainer>
    <Loader role="status" aria-label={t`Loading app`} aria-busy="true" />
  </StyledContainer>
);
