import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type WidgetHeaderCommandMenuItem = Pick<
  CommandMenuItemFieldsFragment,
  'applicationId' | 'id' | 'universalIdentifier'
>;

export const getWidgetHeaderCommandMenuItems = <
  TCommandMenuItem extends WidgetHeaderCommandMenuItem,
>({
  commandMenuItems,
  commandMenuItemUniversalIdentifiers,
  applicationId,
}: {
  commandMenuItems: TCommandMenuItem[];
  commandMenuItemUniversalIdentifiers: string[];
  applicationId: string;
}): TCommandMenuItem[] => {
  const commandMenuItemsByUniversalIdentifier = new Map(
    commandMenuItems
      .filter(({ universalIdentifier }) => isDefined(universalIdentifier))
      .map((commandMenuItem) => [
        commandMenuItem.universalIdentifier,
        commandMenuItem,
      ]),
  );
  const seenUniversalIdentifiers = new Set<string>();

  return commandMenuItemUniversalIdentifiers.flatMap(
    (commandMenuItemUniversalIdentifier) => {
      if (seenUniversalIdentifiers.has(commandMenuItemUniversalIdentifier)) {
        return [];
      }

      seenUniversalIdentifiers.add(commandMenuItemUniversalIdentifier);

      const commandMenuItem = commandMenuItemsByUniversalIdentifier.get(
        commandMenuItemUniversalIdentifier,
      );

      return isDefined(commandMenuItem) &&
        commandMenuItem.applicationId === applicationId
        ? [commandMenuItem]
        : [];
    },
  );
};
