import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const navigationMenuItemsDraftStateV2 = createState<
  NavigationMenuItem[] | null
>({
  key: 'navigationMenuItemsDraftStateV2',
  defaultValue: null,
});
