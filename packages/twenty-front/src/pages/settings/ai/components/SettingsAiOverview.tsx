import { formatNumber } from '@/localization/utils/formatNumber';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPrompt, IconSparkles } from 'twenty-ui/icon';
import { Textarea } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';

export const SettingsAiOverview = ({
  avatarSection,
  behaviorSection,
  summarySection,
  secondaryBar,
  workspaceInstructions,
  onWorkspaceInstructionsChange,
  isWorkspaceInstructionsDisabled = false,
  onMcpSetup,
  onSystemPromptsOpen,
  systemPromptTokenCount,
}: SettingsAiOverviewProps) => {
  const theme = useTheme();
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        { abbreviate: true, decimals: 1 },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  return (
    <SettingsPageLayout
      title={t`AI`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`AI` },
      ]}
      secondaryBar={secondaryBar}
    >
      <SettingsPageContainer>
        {avatarSection}
        {behaviorSection}
        {summarySection}
        <Section.Root>
          <Section.Header
            title={t`MCP Server`}
            description={t`Connect AI assistants like Claude or Cursor to your workspace via the Model Context Protocol`}
          />
          <SettingsCard
            Icon={<IconSparkles size={theme.icon.size.xl} />}
            title={t`Set up MCP`}
            onClick={onMcpSetup}
            disabled={!isDefined(onMcpSetup)}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Workspace Instructions`}
            description={t`Custom instructions appended to every system prompt`}
          />
          <Textarea
            aria-label={t`Workspace Instructions`}
            value={workspaceInstructions}
            onValueChange={(value) => onWorkspaceInstructionsChange?.(value)}
            disabled={isWorkspaceInstructionsDisabled}
            readOnly={!isDefined(onWorkspaceInstructionsChange)}
            rows={4}
            placeholder={t`E.g., "We are a B2B SaaS company. Always use formal language..."`}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`System Prompt`}
            description={systemPromptDescription}
          />
          <SettingsCard
            Icon={<IconPrompt size={theme.icon.size.xl} />}
            title={t`Read system prompts`}
            onClick={onSystemPromptsOpen}
            disabled={!isDefined(onSystemPromptsOpen)}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
