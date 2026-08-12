import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Set when the recipients were reached through a relation on another object
// (e.g. the mentors of the selected mentorships) rather than selected directly.
export type MassEmailRelatedSource = {
  objectNameSingular: string;
  relationFieldLabel: string;
  sourceObjectLabelPlural: string;
  sourceRecordLabelsByPersonId: Record<string, string[]>;
  sourceRecordLabelsWithoutRelatedPerson: string[];
  hasUnreadSourceRecords: boolean;
};

export const massEmailRelatedSourceState =
  createAtomState<MassEmailRelatedSource | null>({
    key: 'massEmailRelatedSourceState',
    defaultValue: null,
    useSessionStorage: true,
  });
