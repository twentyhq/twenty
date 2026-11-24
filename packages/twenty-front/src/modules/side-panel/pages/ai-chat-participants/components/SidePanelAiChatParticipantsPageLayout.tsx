import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type SidePanelAiChatParticipantsPageLayoutProps = {
  header?: ReactNode;
  footerActions?: ReactNode[];
  children: ReactNode;
};

export const SidePanelAiChatParticipantsPageLayout = ({
  header,
  footerActions,
  children,
}: SidePanelAiChatParticipantsPageLayoutProps) => (
  <StyledContainer>
    {header}
    <StyledListContainer>{children}</StyledListContainer>
    {isNonEmptyArray(footerActions) && (
      <SidePanelFooter actions={footerActions} />
    )}
  </StyledContainer>
);
