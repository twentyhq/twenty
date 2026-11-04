import { type ReactNode } from 'react';

export type SettingsAiOverviewProps = {
  avatarSection?: ReactNode;
  behaviorSection?: ReactNode;
  summarySection?: ReactNode;
  secondaryBar?: ReactNode;
  mcpSection: ReactNode;
  workspaceInstructionsSection: ReactNode;
  systemPromptSection: ReactNode;
};
