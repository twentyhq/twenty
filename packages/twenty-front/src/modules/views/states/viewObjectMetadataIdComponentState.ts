import { createComponentState } from 'twenty-ui';

export const viewObjectMetadataIdComponentState = createComponentState<
  string | undefined
>({
  key: 'viewObjectMetadataIdComponentState',
  defaultValue: undefined,
});
