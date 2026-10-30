import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AI_INSTRUCTIONS_EDITOR_PROFILE } from '@/ai/constants/AiInstructionsEditorProfile';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAiWorkspaceInstructionsSection = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const initialInstructions = currentWorkspace?.aiAdditionalInstructions ?? '';
  const [workspaceInstructions, setWorkspaceInstructions] =
    useState(initialInstructions);
  const [originalInstructions, setOriginalInstructions] =
    useState(initialInstructions);

  const autoSave = useDebouncedCallback(async (newValue: string) => {
    if (!currentWorkspace?.id || newValue === originalInstructions) return;
    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        aiAdditionalInstructions: newValue || null,
      });
      await updateWorkspace({
        variables: {
          input: { aiAdditionalInstructions: newValue || null },
        },
      });
      setOriginalInstructions(newValue);
    } catch (error) {
      setCurrentWorkspace({
        ...currentWorkspace,
        aiAdditionalInstructions: originalInstructions || null,
      });
      if (CombinedGraphQLErrors.is(error)) {
        enqueueToast(getToastOptionsFromError({ error }));
      } else {
        enqueueToast({
          status: 'error',
          children: t`Failed to save workspace instructions`,
        });
      }
    }
  }, 1000);

  return (
    <Section.Root>
      <Section.Header
        title={t`Workspace Instructions`}
        description={t`Custom instructions appended to every system prompt`}
      />
      <StyledInstructionsContainer>
        <FormAdvancedTextFieldInput
          key={originalInstructions}
          readonly={false}
          defaultValue={workspaceInstructions}
          profile={AI_INSTRUCTIONS_EDITOR_PROFILE}
          onChange={(value) => {
            setWorkspaceInstructions(value);
            autoSave(value);
          }}
          enableFullScreen={true}
          fullScreenBreadcrumbs={[
            { children: t`System Prompt`, href: '#' },
            { children: t`Workspace Instructions` },
          ]}
          placeholder={t`E.g., "We are a B2B SaaS company. Always use formal language..."`}
          minHeight={150}
        />
      </StyledInstructionsContainer>
    </Section.Root>
  );
};
