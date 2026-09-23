export const buildServerCronDispatchJobId = ({
  stepJobId,
  workspaceId,
  targetLogicFunctionUniversalIdentifier,
}: {
  stepJobId: string;
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
}): string =>
  `${stepJobId}.${workspaceId}.${targetLogicFunctionUniversalIdentifier}`;
