import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// A null shortLabel opts an item out of text, so the single labelled slot goes to the first item that has one.
export const getLabelledPinnedCommandMenuItemId = (
  pinnedCommandMenuItems: CommandMenuItemFieldsFragment[],
): string | null =>
  pinnedCommandMenuItems.find((item) => isDefined(item.shortLabel))?.id ?? null;
