import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useDebouncedCallback } from 'use-debounce';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  useGetAiSystemPromptQuery,
  useUpdateWorkspaceMutation,
} from '~/generated-metadata/graphql';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAIPrompts = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const { data: systemPromptData, loading: systemPromptLoading } =
    useGetAiSystemPromptQuery();

  const [workspaceInstructions, setWorkspaceInstructions] = useState(
    currentWorkspace?.aiAdditionalInstructions ?? '',
  );
  const [originalInstructions, setOriginalInstructions] = useState(
    currentWorkspace?.aiAdditionalInstructions ?? '',
  );

  useEffect(() => {
    if (currentWorkspace?.aiAdditionalInstructions !== undefined) {
      setWorkspaceInstructions(
        currentWorkspace.aiAdditionalInstructions ?? '',
      );
      setOriginalInstructions(currentWorkspace.aiAdditionalInstructions ?? '');
    }
  }, [currentWorkspace?.aiAdditionalInstructions]);

  const autoSave = useDebouncedCallback(async (newValue: string) => {
    if (!currentWorkspace?.id || newValue === originalInstructions) {
      return;
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        aiAdditionalInstructions: newValue || null,
      });

      await updateWorkspace({
        variables: {
          input: {
            aiAdditionalInstructions: newValue || null,
          },
        },
      });

      setOriginalInstructions(newValue);
    } catch (error) {
      setCurrentWorkspace({
        ...currentWorkspace,
        aiAdditionalInstructions: originalInstructions || null,
      });

      if (error instanceof ApolloError) {
        enqueueErrorSnackBar({
          apolloError: error,
        });
      } else {
        enqueueErrorSnackBar({
          message: t`Failed to save workspace instructions`,
        });
      }
    }
  }, 1000);

  const handleWorkspaceInstructionsChange = (value: string) => {
    setWorkspaceInstructions(value);
    autoSave(value);
  };

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  const userContextPreview = buildUserContextPreview();

  function buildUserContextPreview(): string {
    if (!currentWorkspaceMember) {
      return '';
    }

    const parts = [
      `**User:** ${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`.trim(),
      `**Locale:** ${currentWorkspaceMember.locale ?? 'en'}`,
    ];

    if (currentWorkspaceMember.timeZone) {
      parts.push(`**Timezone:** ${currentWorkspaceMember.timeZone}`);
    }

    return parts.join('\n\n');
  }

  const systemPrompt = systemPromptData?.getAISystemPrompt ?? '';

  return (
    <SubMenuTopBarContainer
      title={t`System Prompt`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: t`System Prompt` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`System Prompt`}
            description={t`The base instructions that guide AI behavior (managed by Twenty)`}
          />
          <StyledFormContainer>
            <FormAdvancedTextFieldInput
              key={systemPromptLoading ? 'loading' : 'loaded'}
              label={t`Base Instructions`}
              readonly={true}
              defaultValue={systemPrompt}
              contentType="markdown"
              onChange={() => {}}
              enableFullScreen={true}
              fullScreenBreadcrumbs={[
                {
                  children: t`System Prompt`,
                  href: '#',
                },
                {
                  children: t`Base Instructions`,
                },
              ]}
              minHeight={200}
              maxWidth={700}
            />
          </StyledFormContainer>
        </Section>

        <Section>
          <H2Title
            title={t`Workspace Instructions`}
            description={t`Add custom instructions specific to your workspace (appended to system prompt)`}
          />
          <StyledFormContainer>
            <FormAdvancedTextFieldInput
              key={originalInstructions}
              label={t`Additional Instructions`}
              readonly={false}
              defaultValue={workspaceInstructions}
              contentType="markdown"
              onChange={handleWorkspaceInstructionsChange}
              enableFullScreen={true}
              fullScreenBreadcrumbs={[
                {
                  children: t`System Prompt`,
                  href: '#',
                },
                {
                  children: t`Workspace Instructions`,
                },
              ]}
              placeholder={t`E.g., "We are a B2B SaaS company. Always use formal language..."`}
              minHeight={150}
              maxWidth={700}
            />
          </StyledFormContainer>
        </Section>

        <Section>
          <H2Title
            title={t`User Context`}
            description={t`Information about the current user (auto-generated and included in each request)`}
          />
          <StyledFormContainer>
            <FormAdvancedTextFieldInput
              label={t`User Information`}
              readonly={true}
              defaultValue={userContextPreview}
              contentType="markdown"
              onChange={() => {}}
              enableFullScreen={false}
              minHeight={80}
              maxWidth={700}
            />
          </StyledFormContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

