import { createState } from 'twenty-ui';

export const contextStoreCurrentObjectMetadataIdState = createState<
  string | null
>({
  key: 'contextStoreCurrentObjectMetadataIdState',
  defaultValue: null,
});
