import { type SettingsAiWorkspaceInstructionsDraft } from '@/settings/ai/types/SettingsAiWorkspaceInstructionsDraft';

export const getSettingsAiWorkspaceInstructionsDraftAfterSave = ({
  draft,
  workspaceId,
  savedInstructions,
}: {
  draft: SettingsAiWorkspaceInstructionsDraft | null;
  workspaceId: string;
  savedInstructions: string;
}): SettingsAiWorkspaceInstructionsDraft | null =>
  draft?.workspaceId === workspaceId && draft.value === savedInstructions
    ? null
    : draft;
