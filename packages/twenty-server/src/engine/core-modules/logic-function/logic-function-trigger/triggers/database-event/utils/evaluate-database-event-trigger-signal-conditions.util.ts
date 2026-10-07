import { type WorkspaceSignalName } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSignalStates } from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';

export type SignalConditionsEvaluation =
  | { matches: true }
  | { matches: false; mismatchedSignal: WorkspaceSignalName };

export const evaluateDatabaseEventTriggerSignalConditions = ({
  signalConditions,
  signalStates,
}: {
  signalConditions: Partial<Record<WorkspaceSignalName, boolean>> | undefined;
  signalStates: WorkspaceSignalStates;
}): SignalConditionsEvaluation => {
  if (!isDefined(signalConditions)) {
    return { matches: true };
  }

  for (const [signalName, expected] of Object.entries(signalConditions) as [
    WorkspaceSignalName,
    boolean,
  ][]) {
    const isSet = isDefined(signalStates[signalName]);

    if (isSet !== expected) {
      return { matches: false, mismatchedSignal: signalName };
    }
  }

  return { matches: true };
};

export const collectSignalNamesFromConditions = (
  signalConditionsList: (
    | Partial<Record<WorkspaceSignalName, boolean>>
    | undefined
  )[],
): WorkspaceSignalName[] => [
  ...new Set(
    signalConditionsList
      .filter(isDefined)
      .flatMap(
        (signalConditions) =>
          Object.keys(signalConditions) as WorkspaceSignalName[],
      ),
  ),
];
