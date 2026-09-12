import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Mirrors the ObjectRecordEvent shapes emitted by the server so that variables
// resolved against properties.before / properties.after behave like a real run.
export const buildDatabaseEventTestPayload = ({
  eventName,
  record,
  watchedFields,
}: {
  eventName: string;
  record: ObjectRecord;
  watchedFields?: string[] | null;
}): Record<string, unknown> => {
  const { event } = splitWorkflowTriggerEventName(eventName);

  const updatedFields = isNonEmptyArray(watchedFields)
    ? watchedFields
    : Object.keys(record).filter((fieldName) => fieldName !== '__typename');

  switch (event) {
    case 'deleted': {
      return {
        recordId: record.id,
        properties: {
          before: record,
          after: record,
          updatedFields: ['deletedAt'],
        },
      };
    }
    case 'destroyed': {
      return {
        recordId: record.id,
        properties: { before: record },
      };
    }
    case 'updated':
    case 'upserted': {
      return {
        recordId: record.id,
        properties: { before: record, after: record, updatedFields },
      };
    }
    default: {
      return {
        recordId: record.id,
        properties: { after: record },
      };
    }
  }
};
