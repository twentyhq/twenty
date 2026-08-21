import { interpolateCommandMenuItemPlaceholders } from 'twenty-shared/i18n';
import { type CommandMenuContextApi, type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getCommandMenuItemPlaceholderValues } from '@/command-menu-item/utils/getCommandMenuItemPlaceholderValues';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type InterpolatedCommandMenuItemFields = {
  iconKey: Nullable<string>;
  label: string;
  shortLabel: Nullable<string>;
};

export const interpolateCommandMenuItemFields = (
  item: Pick<CommandMenuItemFieldsFragment, 'label' | 'shortLabel' | 'icon'>,
  commandMenuContextApi: CommandMenuContextApi,
): InterpolatedCommandMenuItemFields => {
  const values = getCommandMenuItemPlaceholderValues(commandMenuContextApi);

  const interpolate = (value: Nullable<string>): Nullable<string> =>
    isDefined(value)
      ? interpolateCommandMenuItemPlaceholders(value, values)
      : value;

  return {
    iconKey: interpolate(item.icon),
    label: interpolateCommandMenuItemPlaceholders(item.label, values),
    shortLabel: interpolate(item.shortLabel),
  };
};
