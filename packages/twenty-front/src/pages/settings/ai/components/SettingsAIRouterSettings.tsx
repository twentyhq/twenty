import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
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
import { H2Title, IconCpu } from 'twenty-ui/display';
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

  const modelOptions = useAiModelOptions();
  const noModelsAvailable = modelOptions.length === 0;

  const handleModelChange = async (value: string) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const newValue = value;
    const previousValue = currentWorkspace?.routerModel || 'auto';

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        routerModel: newValue,
      });

      await updateWorkspace({
        variables: {
          input: {
            routerModel: newValue,
          },
        },
      });

      enqueueSuccessSnackBar({
        message: t`Router model updated successfully`,
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        routerModel: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update router model`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Router`}
        description={t`Router is used in the chat to dispatch to the right agent`}
      />

      <Card rounded>
        <StyledSettingsOptionCardContent>
          <StyledSettingsOptionCardIcon>
            <SettingsOptionIconCustomizer Icon={IconCpu} />
          </StyledSettingsOptionCardIcon>
          <div>
            <StyledSettingsOptionCardTitle>
              {t`Router Model`}
            </StyledSettingsOptionCardTitle>
            <StyledSettingsOptionCardDescription>
              {t`Fast model to route to the right agent`}
            </StyledSettingsOptionCardDescription>
          </div>
          <StyledSelectContainer>
            {noModelsAvailable ? (
              <StyledErrorMessage>
                {t`No models available. Please configure AI models in your workspace settings.`}
              </StyledErrorMessage>
            ) : (
              <Select
                dropdownId="router-model-select"
                value={currentWorkspace?.routerModel || 'auto'}
                onChange={handleModelChange}
                options={modelOptions}
                selectSizeVariant="small"
              />
            )}
          </StyledSelectContainer>
        </StyledSettingsOptionCardContent>
      </Card>
    </Section>
  );
};
