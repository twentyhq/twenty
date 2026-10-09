export type ApplicationLifecycleOperation = 'install' | 'uninstall' | 'upgrade';

export const buildApplicationLifecycleJobId = ({
  operation,
  workspaceId,
  universalIdentifier,
}: {
  operation: ApplicationLifecycleOperation;
  workspaceId: string;
  universalIdentifier: string;
}): string => `${operation}-application.${workspaceId}.${universalIdentifier}`;
