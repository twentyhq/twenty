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
  IconHierarchy2,
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
  FindManyAgentsDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/logic-functions/graphql/queries/findManyLogicFunctions';

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

  const agentsResult = useQuery(FindManyAgentsDocument);
  const logicFunctionsResult = useQuery(FIND_MANY_LOGIC_FUNCTIONS);
  const skillsCount = agentsResult.data?.findManyAgents?.length ?? 0;
  const toolsCount =
    (logicFunctionsResult.data as { findManyLogicFunctions?: unknown[] })
      ?.findManyLogicFunctions?.length ?? 0;

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
                value: '—',
              },
              {
                Icon: IconTool,
                label: t`Tools`,
                value: toolsCount.toString(),
              },
            ],
            [
              {
                Icon: IconSparkles,
                label: t`Skills`,
                value: skillsCount.toString(),
              },
              {
                Icon: IconHierarchy2,
                label: t`AI workflows`,
                value: '—',
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
