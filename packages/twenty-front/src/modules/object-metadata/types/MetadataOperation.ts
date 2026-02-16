export type MetadataOperation =
  | {
      type: 'create';
      createdRecord: Record<string, unknown>;
    }
  | {
      type: 'update';
      updatedRecord: Record<string, unknown>;
      updatedFields?: string[];
    }
  | {
      type: 'delete';
      deletedRecordId: string;
    };
