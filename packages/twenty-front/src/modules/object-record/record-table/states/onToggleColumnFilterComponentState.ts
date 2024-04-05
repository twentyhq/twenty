import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onToggleColumnFilterComponentState = createComponentState<
  ((fieldMetadataId: string) => void) | undefined
>({
  key: 'onToggleColumnFilterComponentState',
  defaultValue: undefined,
});
