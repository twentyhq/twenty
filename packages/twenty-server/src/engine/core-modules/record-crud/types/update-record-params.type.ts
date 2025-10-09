// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectRecord = Record<string, any>;

export type UpdateRecordParams = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecord;
  fieldsToUpdate?: string[];
  workspaceId: string;
  roleId?: string;
};
