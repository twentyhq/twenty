import { createState } from 'twenty-ui';

export const currentObjectMetadataIdState = createState<string | null>({
  key: 'currentObjectMetadataIdState',
  defaultValue: null,
});
