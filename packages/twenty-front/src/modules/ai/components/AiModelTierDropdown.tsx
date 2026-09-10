import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { DEFAULT_AI_CHAT_MODEL_TIER, type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierSlider } from '@/ai/components/AiModelTierSlider';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const SLIDER_DROPDOWN_WIDTH_PX = 286;

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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const [agentChatUserSelectedModelTier, setAgentChatUserSelectedModelTier] =
    useAtomState(agentChatUserSelectedModelTierState);
  const { closeDropdown } = useCloseDropdown();

  // The setup chat runs on the fast tier server-side whatever the workspace
  // setting says, so the control shows what will actually answer.
  const workspaceTier: AiModelTier = isWorkspaceSetupChat
    ? 'fast'
    : (currentWorkspace?.aiChatModelTier ?? DEFAULT_AI_CHAT_MODEL_TIER);

  const selectedTier = agentChatUserSelectedModelTier ?? workspaceTier;
  const selectedResolvedTier = tiers.find((tier) => tier.tier === selectedTier);

  const handleTierChange = (tier: AiModelTier) => {
    setAgentChatUserSelectedModelTier(tier === workspaceTier ? null : tier);
  };

  if (!isDefined(selectedResolvedTier)) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-end"
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={
        <SelectControl
          selectedOption={{
            value: selectedTier,
            label: selectedResolvedTier.label,
            fullLabel: selectedResolvedTier.model?.label,
          }}
          isDisabled={disabled}
          selectSizeVariant="small"
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={SLIDER_DROPDOWN_WIDTH_PX}>
          <StyledSliderContainer
            role="group"
            aria-label={t`Choose a model tier`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                closeDropdown(dropdownId);
              }
            }}
          >
            <AiModelTierSlider
              selectedTier={selectedTier}
              onTierChange={handleTierChange}
              disabled={disabled}
            />
          </StyledSliderContainer>
        </DropdownContent>
      }
    />
  );
};
