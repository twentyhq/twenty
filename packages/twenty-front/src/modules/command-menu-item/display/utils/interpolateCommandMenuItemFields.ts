import { type CommandMenuContextApi, type Nullable } from 'twenty-shared/types';
import { interpolateCommandMenuItemTemplate } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type InterpolatedCommandMenuItemFields = {
  iconKey: Nullable<string>;
  label: string;
  shortLabel: Nullable<string>;
};

export const interpolateCommandMenuItemFields = (
  item: CommandMenuItemFieldsFragment,
  commandMenuContextApi: CommandMenuContextApi,
): InterpolatedCommandMenuItemFields => {
  const iconKey = interpolateCommandMenuItemTemplate({
    label: item.icon,
    context: commandMenuContextApi,
  });

  const label =
    interpolateCommandMenuItemTemplate({
      label: item.label,
      context: commandMenuContextApi,
    }) ?? item.label;

  const shortLabel = interpolateCommandMenuItemTemplate({
    label: item.shortLabel,
    context: commandMenuContextApi,
  });

  return { iconKey, label, shortLabel };
};
