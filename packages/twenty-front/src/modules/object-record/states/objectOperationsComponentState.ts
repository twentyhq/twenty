import { createState } from 'twenty-ui/utilities';

export type ObjectOperationData =
  | {
      type: 'update-one';
      result: {
        updateInput: any;
      };
    }
  | {
      type: 'update-many';
      result: {
        updateInputs: any[];
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

export type ObjectOperation = {
  id: string;
  objectMetadataItemId: string;
  data: ObjectOperationData;
  timestamp: number;
};

export const objectOperationsState = createState<ObjectOperation[]>({
  key: 'objectOperationsState',
  defaultValue: [],
});
