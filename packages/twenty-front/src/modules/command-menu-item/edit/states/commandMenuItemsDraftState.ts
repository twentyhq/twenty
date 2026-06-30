import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuItemsDraftState = createAtomState<
  CommandMenuItemFieldsFragment[] | null
>({
  key: 'commandMenuItemsDraftState',
  defaultValue: null,
});
