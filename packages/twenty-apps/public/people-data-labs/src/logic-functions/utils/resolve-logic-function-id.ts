export const resolveLogicFunctionId = ({
  logicFunctions,
  universalIdentifier,
}: {
  logicFunctions: { id: string; universalIdentifier?: string | null }[];
  universalIdentifier: string;
}): string | undefined =>
  logicFunctions.find(
    (logicFunction) =>
      logicFunction.universalIdentifier === universalIdentifier,
  )?.id;
