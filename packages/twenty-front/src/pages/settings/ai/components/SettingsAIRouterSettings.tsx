import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import {
  useAiModelLabel,
  useAiModelOptions,
} from '@/ai/hooks/useAiModelOptions';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { H2Title, IconBolt, IconBrain } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

const StyledSelectContainer = styled.div`
  justify-content: flex-end;
  margin-left: auto;
  max-width: 120px;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAIRouterSettings = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const aiModels = useRecoilValue(aiModelsState);
  const activeModelOptions = useAiModelOptions();
  const fastModelLabel = useAiModelLabel(currentWorkspace?.fastModel);
  const smartModelLabel = useAiModelLabel(currentWorkspace?.smartModel);

  const currentFastModel = aiModels.find(
    (m) => m.modelId === currentWorkspace?.fastModel,
  );
  const currentSmartModel = aiModels.find(
    (m) => m.modelId === currentWorkspace?.smartModel,
  );

  const fastModelOptions =
    currentFastModel?.deprecated === true
      ? [
          {
            value: currentWorkspace?.fastModel ?? '',
            label: `${fastModelLabel} (deprecated)`,
          },
          ...activeModelOptions,
        ]
      : activeModelOptions;

  const smartModelOptions =
    currentSmartModel?.deprecated === true
      ? [
          {
            value: currentWorkspace?.smartModel ?? '',
            label: `${smartModelLabel} (deprecated)`,
          },
          ...activeModelOptions,
        ]
      : activeModelOptions;

  const noModelsAvailable = activeModelOptions.length === 0;

  const handleFastModelChange = async (value: string) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const newValue = value;
    const previousValue = currentWorkspace?.fastModel || DEFAULT_FAST_MODEL;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        fastModel: newValue,
      });

      await updateWorkspace({
        variables: {
          input: {
            fastModel: newValue,
          },
        },
      });

      enqueueSuccessSnackBar({
        message: t`Fast model updated successfully`,
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        fastModel: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update fast model`,
      });
    }
  };

  const handleSmartModelChange = async (value: string) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const newValue = value;
    const previousValue = currentWorkspace?.smartModel || DEFAULT_SMART_MODEL;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: newValue,
      });

      await updateWorkspace({
        variables: {
          input: {
            smartModel: newValue,
          },
        },
      });

      enqueueSuccessSnackBar({
        message: t`Smart model updated successfully`,
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update smart model`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`AI Models`}
        description={t`Configure AI models for routing and planning`}
      />

      {noModelsAvailable ? (
        <Card rounded>
          <StyledSettingsOptionCardContent>
            <StyledErrorMessage>
              {t`No models available. Please configure AI models in your workspace settings.`}
            </StyledErrorMessage>
          </StyledSettingsOptionCardContent>
        </Card>
      ) : (
        <Card rounded>
          <StyledSettingsOptionCardContent>
            <StyledSettingsOptionCardIcon>
              <SettingsOptionIconCustomizer Icon={IconBolt} />
            </StyledSettingsOptionCardIcon>
            <div>
              <StyledSettingsOptionCardTitle>
                {t`Fast Model`}
              </StyledSettingsOptionCardTitle>
              <StyledSettingsOptionCardDescription>
                {t`Quick model for routing decisions`}
              </StyledSettingsOptionCardDescription>
            </div>
            <StyledSelectContainer>
              <Select
                dropdownId="fast-model-select"
                value={currentWorkspace?.fastModel || DEFAULT_FAST_MODEL}
                onChange={handleFastModelChange}
                options={fastModelOptions}
                selectSizeVariant="small"
              />
            </StyledSelectContainer>
          </StyledSettingsOptionCardContent>

          <StyledSettingsOptionCardContent>
            <StyledSettingsOptionCardIcon>
              <SettingsOptionIconCustomizer Icon={IconBrain} />
            </StyledSettingsOptionCardIcon>
            <div>
              <StyledSettingsOptionCardTitle>
                {t`Smart Model`}
              </StyledSettingsOptionCardTitle>
              <StyledSettingsOptionCardDescription>
                {t`Advanced model for complex planning`}
              </StyledSettingsOptionCardDescription>
            </div>
            <StyledSelectContainer>
              <Select
                dropdownId="smart-model-select"
                value={currentWorkspace?.smartModel || DEFAULT_SMART_MODEL}
                onChange={handleSmartModelChange}
                options={smartModelOptions}
                selectSizeVariant="small"
              />
            </StyledSelectContainer>
          </StyledSettingsOptionCardContent>
        </Card>
      )}
    </Section>
  );
};
