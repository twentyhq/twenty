export const getSettingsAiModelsSectionVisibility = ({
  isInboxEnabled,
  canReadSystemPrompts,
}: {
  isInboxEnabled: boolean;
  canReadSystemPrompts: boolean;
}) => ({
  isWorkspaceInstructionsSectionVisible: !isInboxEnabled,
  isSystemPromptsSectionVisible: !isInboxEnabled && canReadSystemPrompts,
});
