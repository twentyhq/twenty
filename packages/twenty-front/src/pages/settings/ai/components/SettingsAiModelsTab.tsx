import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAiModelsTable } from '@/settings/ai/components/SettingsAiModelsTable';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { H2Title, IconPrompt, IconStar } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  GetAiSystemPromptPreviewDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledCustomModelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

// Default model pickers (Smart / Fast) moved to SettingsAiOverviewTab —
// this tab is the catalog (Use-best-models toggle + searchable list of
// available models) plus the read-only System Prompt link card.
export const SettingsAiModelsTab = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: previewData } = useQuery(GetAiSystemPromptPreviewDocument);

  const systemPromptTokenCount =
    previewData?.getAiSystemPromptPreview.estimatedTokenCount;
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        { abbreviate: true, decimals: 1 },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  const { useRecommendedModels, realModels } =
    useWorkspaceAiModelAvailability();

  const enabledModelIdSet = new Set(currentWorkspace?.enabledAiModelIds ?? []);

  const handleUseRecommendedToggle = async (checked: boolean) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousValue = currentWorkspace.useRecommendedModels;

    let newEnabledIds = currentWorkspace.enabledAiModelIds ?? [];

    if (!checked && previousValue) {
      const recommendedModelIds = realModels
        .filter((model) => model.isRecommended)
        .map((model) => model.modelId);

      newEnabledIds = recommendedModelIds;
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: checked,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            useRecommendedModels: checked,
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model selection mode`,
      });
    }
  };

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousEnabled = currentWorkspace.enabledAiModelIds ?? [];

    const newEnabledIds = isCurrentlyEnabled
      ? previousEnabled.filter((id) => id !== modelId)
      : [...previousEnabled, modelId];

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: previousEnabled,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

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
              onToggleAll={async (shouldCheckAll) => {
                const previousIds = currentWorkspace?.enabledAiModelIds ?? [];
                const visibleModelIds = new Set(
                  filteredModels.map((m) => m.modelId),
                );

                const newEnabledIds = shouldCheckAll
                  ? [...new Set([...previousIds, ...visibleModelIds])]
                  : previousIds.filter((id) => !visibleModelIds.has(id));

                try {
                  setCurrentWorkspace({
                    ...currentWorkspace!,
                    enabledAiModelIds: newEnabledIds,
                  });
                  await updateWorkspace({
                    variables: { input: { enabledAiModelIds: newEnabledIds } },
                  });
                } catch {
                  setCurrentWorkspace({
                    ...currentWorkspace!,
                    enabledAiModelIds: previousIds,
                  });
                  enqueueErrorSnackBar({
                    message: t`Failed to update model availability`,
                  });
                }
              }}
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
