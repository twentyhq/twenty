import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const validateToolApprovalAlternatives = (
  manifest: Pick<Manifest, 'logicFunctions'>,
): string[] => {
  const toolUniversalIdentifiers = new Set(
    manifest.logicFunctions
      .filter((logicFunction) => isDefined(logicFunction.toolTriggerSettings))
      .map((logicFunction) => logicFunction.universalIdentifier),
  );

  return manifest.logicFunctions.flatMap((logicFunction) =>
    (logicFunction.toolTriggerSettings?.approval?.alternatives ?? [])
      .filter(
        ({ logicFunctionUniversalIdentifier }) =>
          logicFunctionUniversalIdentifier ===
            logicFunction.universalIdentifier ||
          !toolUniversalIdentifiers.has(logicFunctionUniversalIdentifier),
      )
      .map(
        ({ label, logicFunctionUniversalIdentifier }) =>
          `Tool "${logicFunction.name ?? logicFunction.universalIdentifier}" offers approval alternative "${label}" running "${logicFunctionUniversalIdentifier}", which is not another tool of this application.`,
      ),
  );
};
