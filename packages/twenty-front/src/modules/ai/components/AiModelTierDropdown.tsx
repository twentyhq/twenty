import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiModelTierBars } from '@/ai/components/AiModelTierBars';
import { AiModelTierSlider } from '@/ai/components/AiModelTierSlider';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const SLIDER_DROPDOWN_WIDTH_PX = 240;

const StyledSliderContainer = styled.div`
  padding: ${themeCssVariables.spacing[3]};
`;

type AiModelTierDropdownProps = {
  dropdownId: string;
  disabled?: boolean;
};

export const AiModelTierDropdown = ({
  dropdownId,
  disabled = false,
}: AiModelTierDropdownProps) => {
  const { t } = useLingui();
  const tiers = useAiModelTiers();
  const { chatTier } = useWorkspaceAiModelTiers();
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const [agentChatUserSelectedModelTier, setAgentChatUserSelectedModelTier] =
    useAtomState(agentChatUserSelectedModelTierState);

  // The setup chat runs on the fast tier server-side whatever the workspace
  // setting says, so the control shows what will actually answer.
  const workspaceTier: AiModelTier = isWorkspaceSetupChat ? 'fast' : chatTier;

  const selectedTier = agentChatUserSelectedModelTier ?? workspaceTier;
  const selectedResolvedTier = tiers[AI_MODEL_TIERS.indexOf(selectedTier)];

  const handleTierChange = (tier: AiModelTier) => {
    setAgentChatUserSelectedModelTier(tier === workspaceTier ? null : tier);
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      <Dropdown.Trigger
        disabled={disabled}
        render={
          <AiModelTierBars
            selectedTier={selectedTier}
            label={
              isDefined(selectedResolvedTier.model)
                ? t`${selectedResolvedTier.label}: ${selectedResolvedTier.model.label}`
                : selectedResolvedTier.label
            }
            disabled={disabled}
          />
        }
      />
      <DropdownContent
        width={SLIDER_DROPDOWN_WIDTH_PX}
        side="top"
        align="end"
        sideOffset={8}
        aria-label={t`Choose a model mode`}
      >
        <StyledSliderContainer role="group" aria-label={t`Choose a model mode`}>
          <AiModelTierSlider
            selectedTier={selectedTier}
            onTierChange={handleTierChange}
            disabled={disabled}
          />
        </StyledSliderContainer>
      </DropdownContent>
    </DropdownRoot>
  );
};
