import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment, useContext, useState } from 'react';
import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import {
  H2Title,
  IconBolt,
  IconBrain,
  type IconComponent,
  IconHierarchy2,
  IconMessage,
  IconRobot,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
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

// Pulled forward from SettingsAiMoreTab + SettingsAiModelsTab. This tab is the
// new 80%-case landing surface: default model picker (lifted from Models),
// at-a-glance counts on existing Postgres queries, MCP setup (lifted from
// More), and workspace instructions (lifted from More).

const StyledStatsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, 1fr);
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledStatCard = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledStatIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
`;

const StyledStatText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0]};
`;

const StyledStatLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledStatValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledInstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type StatTileProps = {
  Icon: IconComponent;
  label: string;
  value: string;
};

const StatTile = ({ Icon, label, value }: StatTileProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledStatCard>
      <StyledStatIcon>
        <Icon size={theme.icon.size.md} />
      </StyledStatIcon>
      <StyledStatText>
        <StyledStatLabel>{label}</StyledStatLabel>
        <StyledStatValue>{value}</StyledStatValue>
      </StyledStatText>
    </StyledStatCard>
  );
};

// Deep-link path to the MCP tab on the APIs & Webhooks page. The hash is
// read by SettingsApiWebhooks' useEffect and switches activeTab to 'mcp'
// on mount.
const MCP_DEEP_LINK = `${getSettingsPath(SettingsPath.ApiWebhooks)}#mcp`;

export const SettingsAiOverviewTab = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const aiModels = useAtomStateValue(aiModelsState);
  const { enabledModels } = useWorkspaceAiModelAvailability();

  // Default model state — lifted from SettingsAiModelsTab.
  const currentSmartModel = currentWorkspace?.smartModel;
  const currentFastModel = currentWorkspace?.fastModel;

  const buildPinnedOption = (autoSelectModelId: string) => {
    const autoSelectEntry = aiModels.find(
      (model) => model.modelId === autoSelectModelId,
    );
    if (!autoSelectEntry) return undefined;
    return {
      value: autoSelectModelId,
      label: autoSelectEntry.label,
      Icon: getModelIcon(
        autoSelectEntry.modelFamily,
        autoSelectEntry.providerName,
      ),
      contextualText: t`Best`,
    };
  };

  const smartPinnedOption = buildPinnedOption(AUTO_SELECT_SMART_MODEL_ID);
  const fastPinnedOption = buildPinnedOption(AUTO_SELECT_FAST_MODEL_ID);

  const modelOptions = enabledModels.map((model) => {
    const residencyFlag = model.dataResidency
      ? ` ${getDataResidencyDisplay(model.dataResidency)}`
      : '';
    return {
      value: model.modelId,
      label: `${model.label}${residencyFlag}`,
      Icon: getModelIcon(model.modelFamily, model.providerName),
    };
  });

  const handleModelFieldChange = async (
    field: 'smartModel' | 'fastModel',
    value: string,
  ) => {
    if (!currentWorkspace?.id) return;
    const previousValue = currentWorkspace[field];
    try {
      setCurrentWorkspace({ ...currentWorkspace, [field]: value });
      await updateWorkspace({ variables: { input: { [field]: value } } });
    } catch {
      setCurrentWorkspace({ ...currentWorkspace, [field]: previousValue });
      enqueueErrorSnackBar({ message: t`Failed to update model` });
    }
  };

  // Counts — base-object counts, no Clickhouse needed.
  // TODO: Conversations needs an AiChatThread workspace count endpoint; for
  // now we display "—" and wire when the query exists.
  // TODO: Workflows-using-AI needs a workspace-wide filter on WorkflowVersion
  // steps with AI_AGENT type; "—" until we add it.
  const agentsResult = useQuery(FindManyAgentsDocument);
  const logicFunctionsResult = useQuery(FIND_MANY_LOGIC_FUNCTIONS);
  const skillsCount = agentsResult.data?.findManyAgents?.length ?? 0;
  const toolsCount =
    (logicFunctionsResult.data as { findManyLogicFunctions?: unknown[] })
      ?.findManyLogicFunctions?.length ?? 0;

  // Workspace Instructions — lifted from SettingsAiMoreTab.
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
          title={t`Default model`}
          description={t`The default AI model used for chats, agents, and workflows`}
        />
        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconBrain}
            title={t`Smart Model`}
            description={t`Used for chats, agents, and complex reasoning`}
          >
            <Select
              dropdownId="overview-smart-model-select"
              value={currentSmartModel}
              onChange={(value) => handleModelFieldChange('smartModel', value)}
              options={modelOptions}
              pinnedOption={smartPinnedOption}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconBolt}
            title={t`Fast Model`}
            description={t`Used for lightweight tasks like title generation`}
          >
            <Select
              dropdownId="overview-fast-model-select"
              value={currentFastModel}
              onChange={(value) => handleModelFieldChange('fastModel', value)}
              options={modelOptions}
              pinnedOption={fastPinnedOption}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`At a glance`}
          description={t`What's installed and being used in your workspace`}
        />
        <StyledStatsGrid>
          <StatTile Icon={IconMessage} label={t`Conversations`} value={'—'} />
          <StatTile
            Icon={IconSparkles}
            label={t`Skills`}
            value={skillsCount.toString()}
          />
          <StatTile
            Icon={IconTool}
            label={t`Tools`}
            value={toolsCount.toString()}
          />
          <StatTile Icon={IconHierarchy2} label={t`AI workflows`} value={'—'} />
        </StyledStatsGrid>
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
