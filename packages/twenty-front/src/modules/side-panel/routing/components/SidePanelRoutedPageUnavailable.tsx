import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

export const SidePanelRoutedPageUnavailable = () => {
  const { t } = useLingui();

  return (
    <StyledContainer>{t`This page is no longer available.`}</StyledContainer>
  );
};
