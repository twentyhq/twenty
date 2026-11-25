import { type CommandMenuCoreObjectName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchCoreObjectName =
  (coreObjectName: CommandMenuCoreObjectName | null) =>
  (item: Pick<CommandMenuItemFieldsFragment, 'availabilityCoreObjectName'>) =>
    !isDefined(item.availabilityCoreObjectName) ||
    item.availabilityCoreObjectName === coreObjectName;
