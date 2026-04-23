import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPageTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const SidePanelAskAIInfo = () => {
  const currentAIChatThreadTitle = useAtomStateValue(
    currentAIChatThreadTitleState,
  );

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip
        text={currentAIChatThreadTitle ?? t`Ask AI`}
      />
    </StyledPageTitle>
  );
};
