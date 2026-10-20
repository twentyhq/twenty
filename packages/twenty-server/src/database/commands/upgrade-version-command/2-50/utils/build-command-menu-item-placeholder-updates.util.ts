import { isString } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type MetadataPresentationOverrides } from 'src/engine/metadata-modules/overrides/types/metadata-presentation-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

const DISPLAY_FIELDS = ['label', 'shortLabel', 'icon'] as const;

const LEGACY_PLACEHOLDERS = [
  ['${capitalize(objectMetadataLabel)}', '{objectLabel}'],
  ['${capitalize(objectMetadataItem.labelSingular)}', '{objectLabelSingular}'],
  ['${capitalize(objectMetadataItem.labelPlural)}', '{objectLabelPlural}'],
  ['${objectMetadataItem.icon}', '{objectIcon}'],
] as const;

const convertPlaceholders = (value: string): string => {
  let convertedValue = value;

  for (const [legacyPlaceholder, placeholder] of LEGACY_PLACEHOLDERS) {
    convertedValue = convertedValue.split(legacyPlaceholder).join(placeholder);
  }

  return convertedValue;
};

const convertDisplayFields = <
  TFields extends MetadataPresentationOverrides<'commandMenuItem'>,
>(
  fields: TFields,
): TFields => ({
  ...fields,
  ...Object.fromEntries(
    DISPLAY_FIELDS.flatMap((field) => {
      const value = fields[field];

      return isString(value) ? [[field, convertPlaceholders(value)]] : [];
    }),
  ),
  ...(isDefined(fields.translations)
    ? {
        translations: Object.fromEntries(
          Object.entries(fields.translations).map(([locale, translation]) => [
            locale,
            isDefined(translation)
              ? convertDisplayFields(translation)
              : translation,
          ]),
        ),
      }
    : {}),
});

export const buildCommandMenuItemPlaceholderUpdates = ({
  commandMenuItems,
  now,
}: {
  commandMenuItems: (FlatCommandMenuItem | undefined)[];
  now: string;
}): FlatCommandMenuItem[] => {
  const updates: FlatCommandMenuItem[] = [];

  for (const commandMenuItem of commandMenuItems) {
    if (
      !isDefined(commandMenuItem) ||
      commandMenuItem.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      continue;
    }

    const updatedItem = convertDisplayFields(commandMenuItem);

    for (const field of ['overrides', 'universalOverrides'] as const) {
      const overrides = commandMenuItem[field];

      if (!isDefined(overrides)) {
        continue;
      }

      updatedItem[field] = mapAuthoredOverrideEntries({
        metadataName: 'commandMenuItem',
        overrides,
        mapEntry: convertDisplayFields,
      });
    }

    if (fastDeepEqual(commandMenuItem, updatedItem)) {
      continue;
    }

    updates.push({ ...updatedItem, updatedAt: now });
  }

  return updates;
};
