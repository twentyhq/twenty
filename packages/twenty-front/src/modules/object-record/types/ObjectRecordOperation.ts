import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';

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
      type:
        | 'create-one'
        | 'create-many'
        | 'destroy-one'
        | 'destroy-many'
        | 'delete-one'
        | 'delete-many'
        | 'restore-one'
        | 'restore-many'
        | 'merge-records';
    };
