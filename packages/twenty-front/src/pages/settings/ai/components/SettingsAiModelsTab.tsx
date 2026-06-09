import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsAiModelsTable } from '@/settings/ai/components/SettingsAiModelsTable';
import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconBolt,
  IconBrain,
  IconPrompt,
  IconStar,
} from 'twenty-ui-deprecated/display';
import { SearchInput } from 'twenty-ui-deprecated/input';
import { Card, Section } from 'twenty-ui-deprecated/layout';
import { UndecoratedLink } from 'twenty-ui-deprecated/navigation';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { GetAiSystemPromptPreviewDocument } from '~/generated-metadata/graphql';
import { useSettingsAiModelsActions } from '~/pages/settings/ai/hooks/useSettingsAiModelsActions';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledCustomModelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsAiModelsTab = () => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: previewData } = useQuery(GetAiSystemPromptPreviewDocument);
  const aiModels = useAtomStateValue(aiModelsState);
  const { useRecommendedModels, realModels, enabledModels } =
    useWorkspaceAiModelAvailability();
  const {
    handleModelFieldChange,
    handleUseRecommendedToggle,
    handleModelToggle,
    handleToggleAllVisibleModels,
  } = useSettingsAiModelsActions();

  const systemPromptTokenCount =
    previewData?.getAiSystemPromptPreview.estimatedTokenCount;
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        { abbreviate: true, decimals: 1 },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  const currentSmartModel = currentWorkspace?.smartModel;
  const currentFastModel = currentWorkspace?.fastModel;

  const buildPinnedOption = (autoSelectModelId: string) => {
    const autoSelectEntry = aiModels.find(
      (model) => model.modelId === autoSelectModelId,
    );
    if (!autoSelectEntry) return undefined;
    return {
      value: autoSelectModelId,
      label: autoSelectEntry.label,
      Icon: getModelIcon(
        autoSelectEntry.modelFamily,
        autoSelectEntry.providerName,
      ),
      contextualText: t`Best`,
    };
  };

  const smartPinnedOption = buildPinnedOption(AUTO_SELECT_SMART_MODEL_ID);
  const fastPinnedOption = buildPinnedOption(AUTO_SELECT_FAST_MODEL_ID);

  const modelOptions = enabledModels.map((model) => {
    const residencyFlag = model.dataResidency
      ? ` ${getDataResidencyDisplay(model.dataResidency)}`
      : '';
    return {
      value: model.modelId,
      label: `${model.label}${residencyFlag}`,
      Icon: getModelIcon(model.modelFamily, model.providerName),
    };
  });

  const enabledModelIdSet = new Set(currentWorkspace?.enabledAiModelIds ?? []);

  const filteredModels = searchQuery.trim()
    ? realModels.filter((model) => {
        const query = searchQuery.toLowerCase();
        return (
          model.label.toLowerCase().includes(query) ||
          (model.modelFamily?.toLowerCase().includes(query) ?? false) ||
          (model.sdkPackage?.toLowerCase().includes(query) ?? false)
        );
      })
    : realModels;

  return (
    <>
      <Section>
        <H2Title
          title={t`Default model`}
          description={t`The default AI model used for chats, agents, and workflows`}
        />
        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconBrain}
            title={t`Smart Model`}
            description={t`Used for chats, agents, and complex reasoning`}
          >
            <Select
              dropdownId="models-tab-smart-model-select"
              value={currentSmartModel}
              onChange={(value) => handleModelFieldChange('smartModel', value)}
              options={modelOptions}
              pinnedOption={smartPinnedOption}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconBolt}
            title={t`Fast Model`}
            description={t`Used for lightweight tasks like title generation`}
          >
            <Select
              dropdownId="models-tab-fast-model-select"
              value={currentFastModel}
              onChange={(value) => handleModelFieldChange('fastModel', value)}
              options={modelOptions}
              pinnedOption={fastPinnedOption}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`Available models`}
          description={t`Models available in the chat model picker`}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconStar}
            title={t`Use best models only`}
            description={t`Restrict available models to a curated list`}
            checked={useRecommendedModels}
            onChange={handleUseRecommendedToggle}
            divider={!useRecommendedModels}
          />
        </Card>

        {!useRecommendedModels && (
          <StyledCustomModelsContainer>
            <SearchInput
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <SettingsAiModelsTable
              models={filteredModels}
              isChecked={(model) => enabledModelIdSet.has(model.modelId)}
              onToggle={handleModelToggle}
              onToggleAll={(shouldCheckAll) =>
                handleToggleAllVisibleModels(
                  shouldCheckAll,
                  new Set(filteredModels.map((m) => m.modelId)),
                )
              }
              anchorPrefix="workspace-model-row"
            />
          </StyledCustomModelsContainer>
        )}
      </Section>

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
