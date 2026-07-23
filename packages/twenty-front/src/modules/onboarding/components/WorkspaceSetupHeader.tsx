import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatCollapseButton } from '@/ai/components/AiChatCollapseButton';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[6]};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type WorkspaceSetupHeaderProps = {
  title: string;
};

export const WorkspaceSetupHeader = ({ title }: WorkspaceSetupHeaderProps) => (
  <StyledHeader>
    <StyledHeaderTitle>{title}</StyledHeaderTitle>
    <AiChatCollapseButton />
    <AiChatCloseButton />
  </StyledHeader>
);
