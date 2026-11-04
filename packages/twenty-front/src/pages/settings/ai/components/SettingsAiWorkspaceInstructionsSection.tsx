import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AI_INSTRUCTIONS_EDITOR_PROFILE } from '@/ai/constants/AiInstructionsEditorProfile';
import { useSettingsAiWorkspaceInstructions } from '@/settings/ai/hooks/useSettingsAiWorkspaceInstructions';
import { styled } from '@linaria/react';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAiWorkspaceInstructionsSection = () => {
  const { t } = useLingui();
  const {
    canEditInstructions,
    workspaceInstructions,
    handleInstructionsChange,
  } = useSettingsAiWorkspaceInstructions();

  return (
    <Section.Root>
      <Section.Header
        title={t`Workspace Instructions`}
        description={t`Custom instructions appended to every system prompt`}
      />
      <StyledInstructionsContainer>
        <FormAdvancedTextFieldInput
          readonly={!canEditInstructions}
          aria-label={t`Workspace Instructions`}
          defaultValue={workspaceInstructions}
          profile={AI_INSTRUCTIONS_EDITOR_PROFILE}
          onChange={handleInstructionsChange}
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
