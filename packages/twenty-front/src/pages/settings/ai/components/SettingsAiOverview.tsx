import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';

export const SettingsAiOverview = ({
  avatarSection,
  behaviorSection,
  summarySection,
  secondaryBar,
  mcpSection,
  workspaceInstructionsSection,
  systemPromptSection,
}: SettingsAiOverviewProps) => {
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
        {mcpSection}
        {workspaceInstructionsSection}
        {systemPromptSection}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
