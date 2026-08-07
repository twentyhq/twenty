import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { ExpandedAiChatHeader } from '@/ai/expanded-chat/components/ExpandedAiChatHeader';
import { ExpandedAiChatThreadRail } from '@/ai/expanded-chat/components/ExpandedAiChatThreadRail';
import { ExpandedAiChatSidePanelHandoffEffect } from '@/ai/expanded-chat/effect-components/ExpandedAiChatSidePanelHandoffEffect';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE = `calc(${themeCssVariables.border.radius.md} + ${themeCssVariables.spacing[1]})`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE} 0 0
    ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE};
  display: flex;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledConversationColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledConversationContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-x: clip;
  width: 100%;
`;

export const ExpandedAiChat = () => {
  const isMobile = useIsMobile();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  return (
    <StyledPanel>
      <ExpandedAiChatSidePanelHandoffEffect />
      {!isMobile && <ExpandedAiChatThreadRail />}
      <StyledConversationColumn>
        <ExpandedAiChatHeader title={currentAiChatThreadTitle ?? t`Ask AI`} />
        <StyledConversationContent>
          <AiChatTab />
        </StyledConversationContent>
      </StyledConversationColumn>
    </StyledPanel>
  );
};
