export type MetadataOperation<T extends Record<string, unknown>> =
  | {
      type: 'create';
      createdRecord: T;
    }
  | {
      type: 'update';
      updatedRecord: T;
      updatedFields?: string[];
    }
  | {
      type: 'delete';
      deletedRecordId: string;
    };
