import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiModelTierBars } from '@/ai/components/AiModelTierBars';
import { AiModelTierSlider } from '@/ai/components/AiModelTierSlider';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { agentChatIsAssistantOffState } from '@/ai/states/agentChatIsAssistantOffState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const SLIDER_DROPDOWN_WIDTH_PX = 240;

const StyledSliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAssistantSwitchRow = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: space-between;
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
  const [agentChatIsAssistantOff, setAgentChatIsAssistantOff] = useAtomState(
    agentChatIsAssistantOffState,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const assistantSwitchId = useId();
  const isAssistantOff = isAiChatInboxEnabled && agentChatIsAssistantOff;

  // The setup chat always runs on the fast tier server-side.
  const workspaceTier: AiModelTier = isWorkspaceSetupChat ? 'fast' : chatTier;

  const selectedTier = agentChatUserSelectedModelTier ?? workspaceTier;
  const selectedResolvedTier = tiers[AI_MODEL_TIERS.indexOf(selectedTier)];

  const tierLabel = isDefined(selectedResolvedTier.model)
    ? t`${selectedResolvedTier.label}: ${selectedResolvedTier.model.label}`
    : selectedResolvedTier.label;
  const triggerLabel = isAssistantOff
    ? t`${AGENT_CHAT_ASSISTANT_NAME} is off`
    : tierLabel;

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
            label={triggerLabel}
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
          {isAiChatInboxEnabled && (
            <StyledAssistantSwitchRow htmlFor={assistantSwitchId}>
              {t`${AGENT_CHAT_ASSISTANT_NAME} replies`}
              <Switch
                id={assistantSwitchId}
                checked={!agentChatIsAssistantOff}
                onCheckedChange={(checked) =>
                  setAgentChatIsAssistantOff(!checked)
                }
                disabled={disabled}
              />
            </StyledAssistantSwitchRow>
          )}
          <AiModelTierSlider
            selectedTier={selectedTier}
            onTierChange={handleTierChange}
            disabled={disabled || isAssistantOff}
          />
        </StyledSliderContainer>
      </DropdownContent>
    </DropdownRoot>
  );
};
