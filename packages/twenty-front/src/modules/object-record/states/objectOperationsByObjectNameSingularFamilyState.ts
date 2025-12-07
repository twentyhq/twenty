import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type ObjectOperationData =
  | {
      type: 'update-one';
      result: {
        updateInput: any;
        updatedRecord: any;
      };
    }
  | {
      type: 'update-many';
      result: {
        updateInputs: any[];
        updatedRecords: any[];
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
        | 'merge-records'
        | 'update-many';
    };

export type ObjectOperation = {
  id: string;
  data: ObjectOperationData;
  timestamp: number;
};

export const objectOperationsByObjectNameSingularFamilyState =
  createFamilyState<ObjectOperation[], { objectNameSingular: string }>({
    key: 'objectOperationsByObjectNameSingularFamilyState',
    defaultValue: [],
  });
