import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, IconPrompt } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import {
  GetAiSystemPromptPreviewDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { SettingsAiMCP } from '~/pages/settings/ai/components/SettingsAiMCP';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAiMoreTab = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const { data: previewData } = useQuery(GetAiSystemPromptPreviewDocument);

  const initialInstructions = currentWorkspace?.aiAdditionalInstructions ?? '';
  const [workspaceInstructions, setWorkspaceInstructions] =
    useState(initialInstructions);
  const [originalInstructions, setOriginalInstructions] =
    useState(initialInstructions);

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

      if (CombinedGraphQLErrors.is(error)) {
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

  const systemPromptTokenCount =
    previewData?.getAiSystemPromptPreview.estimatedTokenCount;
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        {
          abbreviate: true,
          decimals: 1,
        },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  return (
    <>
      <Section>
        <H2Title
          title={t`Workspace Instructions`}
          description={t`Add custom instructions specific to your workspace (appended to system prompt)`}
        />
        <StyledFormContainer>
          <FormAdvancedTextFieldInput
            key={originalInstructions}
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
      <SettingsAiMCP />

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
