export type RelatedPersonSourceRecord = {
  id: string;
  label: string;
  relatedPersonId: string | null;
};

export type RelatedPersonResolution = {
  personIds: string[];
  sourceRecordLabelsByPersonId: Record<string, string[]>;
  sourceRecordLabelsWithoutRelatedPerson: string[];
};
