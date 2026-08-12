import {
  type RelatedPersonResolution,
  type RelatedPersonSourceRecord,
} from '@/activities/emails/related-people/types/RelatedPersonResolution';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// Several source records routinely point at the same person (one mentor across
// many mentorships), so recipients are deduplicated while keeping every source
// record that led to them for display.
export const resolveRelatedPeopleFromSourceRecords = (
  sourceRecords: RelatedPersonSourceRecord[],
): RelatedPersonResolution => {
  const personIds: string[] = [];
  const sourceRecordLabelsByPersonId: Record<string, string[]> = {};
  const sourceRecordLabelsWithoutRelatedPerson: string[] = [];

  for (const sourceRecord of sourceRecords) {
    if (!isNonEmptyString(sourceRecord.relatedPersonId)) {
      sourceRecordLabelsWithoutRelatedPerson.push(sourceRecord.label);

      continue;
    }

    const existingLabels =
      sourceRecordLabelsByPersonId[sourceRecord.relatedPersonId];

    if (!isDefined(existingLabels)) {
      personIds.push(sourceRecord.relatedPersonId);
      sourceRecordLabelsByPersonId[sourceRecord.relatedPersonId] = [
        sourceRecord.label,
      ];

      continue;
    }

    existingLabels.push(sourceRecord.label);
  }

  return {
    personIds,
    sourceRecordLabelsByPersonId,
    sourceRecordLabelsWithoutRelatedPerson,
  };
};
