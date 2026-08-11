import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// A null shortLabel is how an item opts out of ever showing text, so the single
// labelled slot goes to the first item by position that asked for one.
export const getLabelledPinnedCommandMenuItemId = (
  pinnedCommandMenuItems: CommandMenuItemFieldsFragment[],
): string | null =>
  pinnedCommandMenuItems.find((item) => isDefined(item.shortLabel))?.id ?? null;
