export const INSTANCE_FILE_FOLDERS = ['application-manifest'] as const;

export type InstanceFileFolder = (typeof INSTANCE_FILE_FOLDERS)[number];
