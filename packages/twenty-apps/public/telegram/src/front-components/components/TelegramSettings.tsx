import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

import { TelegramConnectSection } from 'src/front-components/components/TelegramConnectSection';
import { TelegramUserLinksList } from 'src/front-components/components/TelegramUserLinksList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

export const TelegramSettings = () => (
  <StyledContainer>
    <TelegramConnectSection />
    <TelegramUserLinksList />
  </StyledContainer>
);
