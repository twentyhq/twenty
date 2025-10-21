import styled from '@emotion/styled';
import { useState } from 'react';
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
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { H2Title, IconCpu } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

const StyledSelectContainer = styled.div`
  justify-content: flex-end;
  margin-left: auto;
`;

export const SettingsAIRouterSettings = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const modelOptions = useAiModelOptions();
  const routerModel = currentWorkspace?.routerModel || 'auto';
  const [selectedModel, setSelectedModel] = useState<string>(routerModel);

  const handleModelChange = async (value: string | number | boolean | null) => {
    const newValue = value as string;
    const previousValue = currentWorkspace?.routerModel || 'auto';
    setSelectedModel(newValue);

    if (!currentWorkspace?.id) {
      return;
    }

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
    } catch (err) {
      setCurrentWorkspace({
        ...currentWorkspace,
        routerModel: previousValue,
      });

      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
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
            <Select
              dropdownId="router-model-select"
              value={selectedModel}
              onChange={handleModelChange}
              options={modelOptions}
              selectSizeVariant="small"
            />
          </StyledSelectContainer>
        </StyledSettingsOptionCardContent>
      </Card>
    </Section>
  );
};
