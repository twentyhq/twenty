import { useRecoilState } from 'recoil';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { t } from '@lingui/core/macro';
import { H2Title, IconBolt } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { PROVIDER_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

const VIRTUAL_MODEL_IDS: Set<string> = new Set([
  DEFAULT_SMART_MODEL,
  DEFAULT_FAST_MODEL,
]);

export const SettingsAIModelsTab = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const aiModels = useRecoilValueV2(aiModelsState);

  const realModels = aiModels.filter(
    (model) => !VIRTUAL_MODEL_IDS.has(model.modelId),
  );

  const currentSmartModel = currentWorkspace?.smartModel;

  const defaultModelOptions = realModels
    .filter((model) => !model.deprecated || model.modelId === currentSmartModel)
    .map((model) => ({
      value: model.modelId,
      label: model.label,
      Icon: PROVIDER_CONFIG[model.provider.toUpperCase()]?.Icon,
    }));

  const handleDefaultModelChange = async (value: string) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousSmartModel = currentWorkspace.smartModel;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: value,
      });

      await updateWorkspace({
        variables: {
          input: {
            smartModel: value,
          },
        },
      });

      enqueueSuccessSnackBar({
        message: t`Default model updated successfully`,
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: previousSmartModel,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update default model`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Default`}
        description={t`Configure your default AI model`}
      />

      <Card rounded>
        <SettingsOptionCardContentSelect
          Icon={IconBolt}
          title={t`Default Model`}
          description={t`Default model for new chats and agents`}
        >
          <Select
            dropdownId="default-model-select"
            value={currentSmartModel}
            onChange={handleDefaultModelChange}
            options={defaultModelOptions}
            selectSizeVariant="small"
          />
        </SettingsOptionCardContentSelect>
      </Card>
    </Section>
  );
};
