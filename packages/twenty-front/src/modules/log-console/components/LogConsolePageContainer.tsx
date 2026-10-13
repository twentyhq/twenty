import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/constants/SettingsContentMaxWidth';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin: 0 auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]}
    ${themeCssVariables.spacing[10]};
  width: 100%;
`;

type LogConsolePageContainerProps = {
  scrollWrapperInstanceId: string;
  children: ReactNode;
};

export const LogConsolePageContainer = ({
  scrollWrapperInstanceId,
  children,
}: LogConsolePageContainerProps) => (
  <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
    <StyledContainer>{children}</StyledContainer>
  </ScrollWrapper>
);
