import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

type DisplayFields = Pick<FlatCommandMenuItem, 'label' | 'shortLabel' | 'icon'>;

const DISPLAY_FIELDS = ['label', 'shortLabel', 'icon'] as const;

const STANDARD_DISPLAY_FIELDS_BY_UNIVERSAL_IDENTIFIER: Record<
  string,
  DisplayFields
> = Object.fromEntries(
  Object.values(STANDARD_COMMAND_MENU_ITEMS).map((item) => [
    item.universalIdentifier,
    { label: item.label, shortLabel: item.shortLabel, icon: item.icon },
  ]),
);

// upgrade:2-33:migrate-command-menu-item-labels-to-placeholders keyed its
// expected display fields on the NAVIGATION engine key alone, so the path-based
// settings commands — which share that key with the per-object navigation items
// but live in the standard definition — had their label, shortLabel and icon
// overwritten with the object placeholder templates. Only object payloads get
// those placeholders filled at read time, so the templates leaked to the client
// and every settings command rendered as "Go to <current object>".
export const computeSettingsNavigationDisplayFieldRestore = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): FlatCommandMenuItem[] => {
  return Object.values(flatCommandMenuItemMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatCommandMenuItem) =>
        flatCommandMenuItem.engineComponentKey ===
          EngineComponentKey.NAVIGATION &&
        !isObjectMetadataCommandMenuItemPayload(flatCommandMenuItem.payload),
    )
    .flatMap((flatCommandMenuItem) => {
      const standardDisplayFields =
        STANDARD_DISPLAY_FIELDS_BY_UNIVERSAL_IDENTIFIER[
          flatCommandMenuItem.universalIdentifier
        ];

      if (
        !isDefined(standardDisplayFields) ||
        DISPLAY_FIELDS.every(
          (field) =>
            flatCommandMenuItem[field] === standardDisplayFields[field],
        )
      ) {
        return [];
      }

      return [
        {
          ...flatCommandMenuItem,
          ...standardDisplayFields,
          updatedAt: now,
        },
      ];
    });
};
