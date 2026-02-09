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
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  useGetAiSystemPromptPreviewQuery,
  useUpdateWorkspaceMutation,
} from '~/generated-metadata/graphql';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledTokenBadge = styled.span`
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1.5)};
  white-space: nowrap;
`;

export const SettingsAIPrompts = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const { data: previewData, loading: previewLoading } =
    useGetAiSystemPromptPreviewQuery();

  const [workspaceInstructions, setWorkspaceInstructions] = useState(
    currentWorkspace?.aiAdditionalInstructions ?? '',
  );
  const [originalInstructions, setOriginalInstructions] = useState(
    currentWorkspace?.aiAdditionalInstructions ?? '',
  );

  const handleWorkspaceInstructionsInit = () => {
    if (currentWorkspace?.aiAdditionalInstructions !== undefined) {
      setWorkspaceInstructions(currentWorkspace.aiAdditionalInstructions ?? '');
      setOriginalInstructions(currentWorkspace.aiAdditionalInstructions ?? '');
    }
  };

  if (
    currentWorkspace?.aiAdditionalInstructions !== undefined &&
    originalInstructions === '' &&
    currentWorkspace.aiAdditionalInstructions !== null &&
    currentWorkspace.aiAdditionalInstructions !== originalInstructions
  ) {
    handleWorkspaceInstructionsInit();
  }

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

  const preview = previewData?.getAISystemPromptPreview;
  const sections = preview?.sections ?? [];

  const buildUserContextPreview = (): string => {
    if (!isDefined(currentWorkspaceMember)) {
      return '';
    }

    const parts = [
      `**${t`User`}:** ${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`.trim(),
      `**${t`Locale`}:** ${currentWorkspaceMember.locale ?? 'en'}`,
    ];

    if (isDefined(currentWorkspaceMember.timeZone)) {
      parts.push(`**${t`Timezone`}:** ${currentWorkspaceMember.timeZone}`);
    }

    return parts.join('\n\n');
  };

  const userContextPreview = buildUserContextPreview();

  const promptSections = sections.filter(
    (section) =>
      section.title !== 'Workspace Instructions' &&
      section.title !== 'User Context',
  );

  const formatTokenCount = (count: number): string => {
    if (count >= 1000) {
      const kTokens = (count / 1000).toFixed(1);

      return t`~${kTokens}k tokens`;
    }

    return t`~${count} tokens`;
  };

  const totalTokenCount = isDefined(preview)
    ? formatTokenCount(preview.estimatedTokenCount)
    : '';
  const pageTitle = isDefined(preview)
    ? t`System Prompt (${totalTokenCount})`
    : t`System Prompt`;

  return (
    <SubMenuTopBarContainer
      title={pageTitle}
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
        {promptSections.map((section) => (
          <Section key={section.title}>
            <H2Title
              title={section.title}
              description={t`Read-only — managed by Twenty`}
              adornment={
                <StyledTokenBadge>
                  {formatTokenCount(section.estimatedTokenCount)}
                </StyledTokenBadge>
              }
            />
            <StyledFormContainer>
              <FormAdvancedTextFieldInput
                key={
                  previewLoading ? `loading-${section.title}` : section.title
                }
                label={section.title}
                readonly={true}
                defaultValue={section.content}
                contentType="markdown"
                onChange={() => {}}
                enableFullScreen={true}
                fullScreenBreadcrumbs={[
                  {
                    children: t`System Prompt`,
                    href: '#',
                  },
                  {
                    children: section.title,
                  },
                ]}
                minHeight={120}
                maxWidth={700}
              />
            </StyledFormContainer>
          </Section>
        ))}

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
