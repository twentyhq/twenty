import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconMessage,
  IconPrompt,
  IconRefresh,
  IconRobot,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { Card } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { AiModelPinSelect } from '@/settings/ai/components/AiModelPinSelect';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { GetAiSystemPromptPreviewDocument } from '~/generated-metadata/graphql';
import { SettingsAiModelTiersPreview } from '~/pages/settings/ai/components/SettingsAiModelTiersPreview';
import { useSettingsAiModelsActions } from '~/pages/settings/ai/hooks/useSettingsAiModelsActions';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledPinnedModelsContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsAiModelsTab = () => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiModels = useAtomStateValue(aiModelsState);
  const tiers = useAiModelTiers();
  const { chatTier, agentTier } = useWorkspaceAiModelTiers();
  const {
    handleChatTierChange,
    handleAgentTierChange,
    handleAutoModelSelectionToggle,
    handlePinnedModelChange,
  } = useSettingsAiModelsActions();

  const { data: previewData } = useQuery(GetAiSystemPromptPreviewDocument);

  const systemPromptTokenCount =
    previewData?.getAiSystemPromptPreview.estimatedTokenCount;
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        { abbreviate: true, decimals: 1 },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  const isAutoModelSelectionEnabled =
    currentWorkspace?.isAutoModelSelectionEnabled ?? true;
  const aiModelIdByTier: Partial<Record<AiModelTier, string>> =
    currentWorkspace?.aiModelIdByTier ?? {};

  const tierOptions = AI_MODEL_TIERS.map((tier) => ({
    value: tier,
    label: getAiModelTierLabel(tier),
  }));

  return (
    <>
      <Section>
        <H2Title
          title={t`Models`}
          description={t`Which level of model people and agents get by default`}
        />
        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconMessage}
            title={t`AI chat`}
            description={t`Model used when you chat with Twenty`}
            divider
          >
            <Select
              dropdownId="models-tab-chat-tier-select"
              value={chatTier}
              onChange={handleChatTierChange}
              options={tierOptions}
              selectSizeVariant="small"
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconRobot}
            title={t`Agents`}
            description={t`Model agents use when they run on their own`}
            divider
          >
            <Select
              dropdownId="models-tab-agent-tier-select"
              value={agentTier}
              onChange={handleAgentTierChange}
              options={tierOptions}
              selectSizeVariant="small"
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSwitch
            Icon={IconRefresh}
            title={t`Choose automatically`}
            description={t`Twenty fills each level with the best model that meets your requirements`}
            checked={isAutoModelSelectionEnabled}
            onChange={handleAutoModelSelectionToggle}
          />
        </Card>

        {!isAutoModelSelectionEnabled && (
          <StyledPinnedModelsContainer>
            <Card rounded>
              {tiers.map((tier, index) => (
                <SettingsOptionCardContentSelect
                  key={tier.tier}
                  title={tier.label}
                  description={
                    tier.isPinned
                      ? t`Pinned`
                      : isDefined(tier.model)
                        ? t`Automatic: ${tier.model.label}`
                        : t`No model available`
                  }
                  divider={index < tiers.length - 1}
                >
                  <AiModelPinSelect
                    dropdownId={`models-tab-pinned-model-select-${tier.tier}`}
                    modelId={aiModelIdByTier[tier.tier] ?? null}
                    onChange={(modelId) =>
                      handlePinnedModelChange(tier.tier, modelId)
                    }
                    aiModels={aiModels}
                    emptyOptionLabel={t`Automatic`}
                    selectSizeVariant="small"
                    dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                  />
                </SettingsOptionCardContentSelect>
              ))}
            </Card>
          </StyledPinnedModelsContainer>
        )}
      </Section>

      <SettingsAiModelTiersPreview />

      <Section>
        <H2Title
          title={t`System Prompt`}
          description={systemPromptDescription}
        />
        <UndecoratedLink to={getSettingsPath(SettingsPath.AiPrompts)}>
          <SettingsCard
            Icon={<IconPrompt size={theme.icon.size.md} />}
            title={t`Read system prompts`}
          />
        </UndecoratedLink>
      </Section>
    </>
  );
};
