import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewObjectMetadataIdComponentState = createComponentState<
  string | undefined
>({
  key: 'viewObjectMetadataIdComponentState',
  defaultValue: undefined,
});
