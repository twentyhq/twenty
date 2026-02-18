import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const navigationMenuItemsDraftStateV2 = createStateV2<
  NavigationMenuItem[] | null
>({
  key: 'navigationMenuItemsDraftStateV2',
  defaultValue: null,
});
