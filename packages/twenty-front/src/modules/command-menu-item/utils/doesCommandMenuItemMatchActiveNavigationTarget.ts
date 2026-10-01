import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchActiveNavigationTarget =
  (activeObjectMetadataItemIds: ReadonlySet<string>) =>
  (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.navigationTargetObjectMetadataId) ||
    activeObjectMetadataItemIds.has(item.navigationTargetObjectMetadataId);
