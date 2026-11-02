import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSparkles } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

export const SettingsAiMcpSection = () => {
  const theme = useTheme();

  return (
    <Section.Root>
      <Section.Header
        title={t`MCP Server`}
        description={t`Connect AI assistants like Claude or Cursor to your workspace via the Model Context Protocol`}
      />
      <SettingsCard
        Icon={<IconSparkles size={theme.icon.size.xl} />}
        title={t`Set up MCP`}
        to={getSettingsPath(
          SettingsPath.AI,
          undefined,
          undefined,
          SETTINGS_AI_TABS.TABS_IDS.MCP,
        )}
      />
    </Section.Root>
  );
};
