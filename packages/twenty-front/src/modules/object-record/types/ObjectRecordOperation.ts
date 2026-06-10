import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { type ObjectRecord } from 'twenty-shared/types';

export type ObjectRecordOperation =
  | {
      type: 'update-one';
      result: {
        updateInput: ObjectRecordOperationUpdateInput;
      };
    }
  | {
      type: 'update-many';
      result: {
        updateInputs: ObjectRecordOperationUpdateInput[];
      };
    }
  | {
      type: 'create-one';
      createdRecord: ObjectRecord;
    }
  | {
      type: 'delete-one';
      deletedRecordId: string;
    }
  | {
      type: 'delete-many';
      deletedRecordIds: string[];
    }
  | {
      type: 'restore-one';
      restoredRecord: ObjectRecord;
    }
  | {
      type: 'restore-many';
      restoredRecords: ObjectRecord[];
    }
  | {
      type: 'destroy-one';
      destroyedRecordId: string;
    }
  | {
      type: 'destroy-many';
      destroyedRecordIds: string[];
    }
  | {
      type: 'create-many' | 'merge-records';
    };
