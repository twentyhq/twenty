export type UpgradeAuditWindow = {
  cursorIndex: number;
  baselineIndex: number;
};

// A command is auditable once the cursor has moved past it: everything before
// the cursor should own a completed record, everything after it is legitimately
// pending. The baseline is where a workspace entered the sequence — a workspace
// provisioned on a recent version never ran the commands preceding it.
export const resolveUpgradeAuditWindow = ({
  stepNames,
  cursorName,
  baselineNames = [],
}: {
  stepNames: string[];
  cursorName: string;
  baselineNames?: string[];
}): UpgradeAuditWindow | null => {
  const cursorIndex = stepNames.indexOf(cursorName);

  if (cursorIndex === -1) {
    return null;
  }

  const baselineIndex = baselineNames.reduce(
    (furthestIndex, baselineName) =>
      Math.max(furthestIndex, stepNames.indexOf(baselineName)),
    -1,
  );

  return { cursorIndex, baselineIndex };
};

export const isStepInUpgradeAuditWindow = ({
  stepIndex,
  window: { cursorIndex, baselineIndex },
}: {
  stepIndex: number;
  window: UpgradeAuditWindow;
}): boolean => stepIndex < cursorIndex && stepIndex > baselineIndex;
