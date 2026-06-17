import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsStatsGrid } from '@/settings/components/SettingsStatsGrid';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment, useContext, useState } from 'react';
import {
  H2Title,
  IconMessage,
  IconRobot,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import {
  FindWorkspaceAiStatsDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

const StyledInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const MCP_DEEP_LINK = `${getSettingsPath(SettingsPath.ApiWebhooks)}#mcp`;

export const SettingsAiOverviewTab = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const { data: aiStatsData } = useQuery(FindWorkspaceAiStatsDocument);
  const stats = aiStatsData?.findWorkspaceAiStats;

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
        enqueueErrorSnackBar({ apolloError: error });
      } else {
        enqueueErrorSnackBar({
          message: t`Failed to save workspace instructions`,
        });
      }
    }
  }, 1000);

  return (
    <Fragment>
      <Section>
        <H2Title
          title={t`At a glance`}
          description={t`What's installed and being used in your workspace`}
        />
        <SettingsStatsGrid
          columns={[
            [
              {
                Icon: IconMessage,
                label: t`Conversations`,
                value: stats ? stats.conversationsCount.toString() : '—',
              },
            ],
            [
              {
                Icon: IconSparkles,
                label: t`Skills`,
                value: stats ? stats.skillsCount.toString() : '—',
              },
            ],
            [
              {
                Icon: IconTool,
                label: t`Tools`,
                value: stats ? stats.toolsCount.toString() : '—',
              },
            ],
          ]}
        />
      </Section>

      <Section>
        <H2Title
          title={t`MCP Server`}
          description={t`Connect AI assistants like Claude or Cursor to your workspace via the Model Context Protocol`}
        />
        <UndecoratedLink to={MCP_DEEP_LINK}>
          <SettingsCard
            Icon={<IconRobot size={theme.icon.size.md} />}
            title={t`Set up MCP`}
          />
        </UndecoratedLink>
      </Section>

      <Section>
        <H2Title
          title={t`Workspace Instructions`}
          description={t`Custom instructions appended to every system prompt`}
        />
        <StyledInstructionsContainer>
          <FormAdvancedTextFieldInput
            key={originalInstructions}
            readonly={false}
            defaultValue={workspaceInstructions}
            contentType="markdown"
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
            maxWidth={700}
          />
        </StyledInstructionsContainer>
      </Section>
    </Fragment>
  );
};
