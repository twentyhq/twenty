import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onToggleColumnSortComponentState = createComponentState<
  ((fieldMetadataId: string) => void) | undefined
>({
  key: 'onToggleColumnSortComponentState',
  defaultValue: undefined,
});
