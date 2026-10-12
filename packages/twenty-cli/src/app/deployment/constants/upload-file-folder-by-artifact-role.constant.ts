import { type MetadataSchema } from 'twenty-client-sdk/metadata';

export const UPLOAD_FILE_FOLDER_BY_ARTIFACT_ROLE: Partial<
  Record<string, MetadataSchema.FileFolder>
> = {
  'built-logic-function': 'BuiltLogicFunction',
  'built-front-component': 'BuiltFrontComponent',
  source: 'Source',
  dependencies: 'Dependencies',
  'public-asset': 'PublicAsset',
};
