import { isString } from '@sniptt/guards';
import {
  buildObjectMetadataLabelPlaceholderValues,
  type MetadataLabelPlaceholderValues,
} from 'twenty-shared/i18n';
import { type CommandMenuContextApi } from 'twenty-shared/types';

// objectLabel is the only placeholder the client supplies: singular or plural per selection.
export const getCommandMenuItemPlaceholderValues = (
  commandMenuContextApi: CommandMenuContextApi,
): MetadataLabelPlaceholderValues => {
  const { labelSingular, labelPlural, icon } =
    commandMenuContextApi.objectMetadataItem;

  return buildObjectMetadataLabelPlaceholderValues({
    label: commandMenuContextApi.objectMetadataLabel,
    labelSingular: isString(labelSingular) ? labelSingular : undefined,
    labelPlural: isString(labelPlural) ? labelPlural : undefined,
    icon: isString(icon) ? icon : undefined,
  });
};
