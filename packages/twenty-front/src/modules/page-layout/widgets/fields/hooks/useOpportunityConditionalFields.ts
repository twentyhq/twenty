import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

// Returns a Set of field names that should be hidden for an opportunity record
// based on its current field values.
export const useOpportunityConditionalFields = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}): Set<string> => {
  const record = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const hiddenFields = new Set<string>();

  if (objectNameSingular !== 'opportunity' || record === null) {
    return hiddenFields;
  }

  const r = record as Record<string, unknown>;

  // clientAccountTeam is visible only when addClientAccountTeam is true
  if (r['addClientAccountTeam'] !== true) {
    hiddenFields.add('clientAccountTeam');
  }

  // lossReason and lossNotes are visible only when salesStage is a loss stage
  const lossStages = new Set(['CLOSEDLOST', 'DIDNOTPROCEED']);
  if (!lossStages.has(r['salesStage'] as string)) {
    hiddenFields.add('lossReason');
    hiddenFields.add('lossNotes');
  }

  return hiddenFields;
};
