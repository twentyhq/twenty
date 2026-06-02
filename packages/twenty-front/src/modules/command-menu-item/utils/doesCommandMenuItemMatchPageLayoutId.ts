import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchPageLayoutId =
  (pageLayoutId: string | null) => (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.pageLayoutId) || item.pageLayoutId === pageLayoutId;
