import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { ObjectRecord } from 'twenty-shared/types';

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
  } |
  {
      type:
        | 'create-many'
        | 'destroy-one'
        | 'destroy-many'
        | 'delete-one'
        | 'delete-many'
        | 'restore-one'
        | 'restore-many'
        | 'merge-records';
    };
