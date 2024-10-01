import { createState } from 'twenty-ui';

export const currentObjectMetadataId = createState<string | null>({
  key: 'currentObjectMetadataId',
  defaultValue: null,
});
