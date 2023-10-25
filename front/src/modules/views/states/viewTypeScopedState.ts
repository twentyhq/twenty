import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { ViewType } from '~/generated/graphql';

export const viewTypeScopedState = createScopedState<ViewType>({
  key: 'viewTypeScopedState',
  defaultValue: ViewType.Table,
});
