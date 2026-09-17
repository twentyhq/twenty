import { isNonEmptyString } from '@sniptt/guards';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

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
