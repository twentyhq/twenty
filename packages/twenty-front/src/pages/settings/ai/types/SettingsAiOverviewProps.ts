import { type ReactNode } from 'react';

export type SettingsAiOverviewProps = {
  avatarSection?: ReactNode;
  behaviorSection?: ReactNode;
  summarySection?: ReactNode;
  secondaryBar?: ReactNode;
  workspaceInstructions: string;
  onWorkspaceInstructionsChange?: (value: string) => void;
  isWorkspaceInstructionsDisabled?: boolean;
  onMcpSetup?: () => void;
  onSystemPromptsOpen?: () => void;
  systemPromptTokenCount?: number;
};
