// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectRecord = Record<string, any>;

export type CreateRecordParams = {
  objectName: string;
  objectRecord: ObjectRecord;
  workspaceId: string;
  roleId?: string;
};
