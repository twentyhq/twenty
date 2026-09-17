import { isNonEmptyString } from '@sniptt/guards';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

// The section holds everything scoped to the object in context, so it is named
// after that object rather than after the view: importing, creating a view and
// editing the layout all belong to the object, not to what you are looking at
// right now.
export const getCommandMenuItemObjectSectionHeading = ({
  commandMenuContextApi,
  fallbackHeading,
}: {
  commandMenuContextApi: CommandMenuContextApi;
  fallbackHeading: string;
}): string => {
  const objectLabelPlural =
    commandMenuContextApi.objectMetadataItem.labelPlural;

  return isNonEmptyString(objectLabelPlural)
    ? capitalize(objectLabelPlural)
    : fallbackHeading;
};
