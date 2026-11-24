import styled from '@emotion/styled';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSeparatorContainer = styled.div`
  padding-inline: ${() => themeCssVariables.spacing[4]};
`;

export const SettingsCardSeparator = () => (
  <StyledSeparatorContainer>
    <Separator />
  </StyledSeparatorContainer>
);
