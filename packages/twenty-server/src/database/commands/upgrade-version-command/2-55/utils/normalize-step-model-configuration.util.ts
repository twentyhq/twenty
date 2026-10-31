import { type StepAgentInlineConfig } from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

export type StoredModelConfiguration = {
  webSearch?: { enabled?: unknown; configuration?: unknown } | null;
  twitterSearch?: { enabled?: unknown; configuration?: unknown } | null;
} | null;

// the runtime only reads whether each native tool is on
export const normalizeStepModelConfiguration = (
  modelConfiguration: StoredModelConfiguration,
): StepAgentInlineConfig['modelConfiguration'] => {
  const webSearch = modelConfiguration?.webSearch?.enabled;
  const twitterSearch = modelConfiguration?.twitterSearch?.enabled;

  if (typeof webSearch !== 'boolean' && typeof twitterSearch !== 'boolean') {
    return null;
  }

  return {
    ...(typeof webSearch === 'boolean'
      ? { webSearch: { enabled: webSearch } }
      : {}),
    ...(typeof twitterSearch === 'boolean'
      ? { twitterSearch: { enabled: twitterSearch } }
      : {}),
  };
};
