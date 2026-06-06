import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getToolLink = (tool: SettingsAgentToolItem): string =>
  getSettingsPath(SettingsPath.AiToolDetail, {
    toolIdentifier: tool.identifier,
  });
