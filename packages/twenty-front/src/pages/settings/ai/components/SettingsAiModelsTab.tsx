import { t } from '@lingui/core/macro';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { IconMessageCircle, IconRobot, IconWand } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierIndicator } from '@/ai/components/AiModelTierIndicator';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { AiModelPinSelect } from '@/settings/ai/components/AiModelPinSelect';
import { getAiModelModeDescription } from '@/settings/ai/utils/getAiModelModeDescription';
import { NestedSettingsRow } from '@/settings/components/SettingsOptions/NestedSettingsRow';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsAiModelTiersPreview } from '~/pages/settings/ai/components/SettingsAiModelTiersPreview';
import { useSettingsAiModelsActions } from '~/pages/settings/ai/hooks/useSettingsAiModelsActions';

export const SettingsAiModelsTab = () => {
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

  const isAutoModelSelectionEnabled =
    currentWorkspace?.isAutoModelSelectionEnabled ?? true;
  const aiModelIdByTier: Partial<Record<AiModelTier, string>> =
    currentWorkspace?.aiModelIdByTier ?? {};

  const tierOptions = AI_MODEL_TIERS.map((tier) => ({
    value: tier,
    label: getAiModelTierLabel(tier),
    LeftComponent: <AiModelTierIndicator tier={tier} />,
  }));

  return (
    <>
      <Section>
        <H2Title
          title={t`Models`}
          description={t`Choose the default modes for people and agents`}
        />
        <Card rounded backgroundColor={themeCssVariables.background.secondary}>
          <StyledSettingsSelectGroup controlWidth={160}>
            <SettingsOptionCardContentSelect
              Icon={IconMessageCircle}
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
          </StyledSettingsSelectGroup>
          <SettingsOptionCardContentSwitch
            Icon={IconWand}
            title={t`Choose automatically`}
            description={t`Twenty fills each level with the best model that meets your requirements`}
            checked={isAutoModelSelectionEnabled}
            onChange={handleAutoModelSelectionToggle}
          />
          {!isAutoModelSelectionEnabled && (
            <StyledSettingsSelectGroup controlWidth={260}>
              {tiers.map((tier, index) => (
                <NestedSettingsRow
                  key={tier.tier}
                  isLast={index === tiers.length - 1}
                >
                  <SettingsOptionCardContentSelect
                    icon={<AiModelTierIndicator tier={tier.tier} />}
                    title={tier.label}
                    description={getAiModelModeDescription(tier)}
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
                </NestedSettingsRow>
              ))}
            </StyledSettingsSelectGroup>
          )}
        </Card>
      </Section>

      <SettingsAiModelTiersPreview />
    </>
  );
};
