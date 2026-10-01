import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS } from 'src/database/commands/upgrade-version-command/2-45/constants/discoverable-email-and-calendar-objects.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const haveSameItems = (
  left: readonly string[] | null,
  right: readonly string[] | null,
): boolean =>
  left === right ||
  (isDefined(left) &&
    isDefined(right) &&
    left.length === right.length &&
    left.every((item, index) => item === right[index]));

export const buildDiscoverableEmailAndCalendarObjectUpdates = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<FlatFieldMetadata, 'objectMetadataId'>>
    >;
  };
}): FlatObjectMetadata[] =>
  DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS.flatMap((declaration) => {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        declaration.universalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      return [];
    }

    // Older workspaces may miss a recently added field; declaring it anyway
    // would point at nothing.
    const discoverableFieldUniversalIdentifiers =
      declaration.discoverableFieldUniversalIdentifiers.filter(
        (fieldUniversalIdentifier) =>
          flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier]
            ?.objectMetadataId === flatObjectMetadata.id,
      );

    const readability =
      'readability' in declaration
        ? declaration.readability
        : flatObjectMetadata.readability;
    const readabilityParentFieldUniversalIdentifiers =
      'readabilityParentFieldUniversalIdentifiers' in declaration
        ? declaration.readabilityParentFieldUniversalIdentifiers
        : flatObjectMetadata.readabilityParentFieldUniversalIdentifiers;

    if (
      flatObjectMetadata.readability === readability &&
      haveSameItems(
        flatObjectMetadata.readabilityParentFieldUniversalIdentifiers,
        readabilityParentFieldUniversalIdentifiers,
      ) &&
      haveSameItems(
        flatObjectMetadata.discoverableFieldUniversalIdentifiers,
        discoverableFieldUniversalIdentifiers,
      )
    ) {
      return [];
    }

    return [
      {
        ...flatObjectMetadata,
        readability,
        readabilityParentFieldUniversalIdentifiers: isDefined(
          readabilityParentFieldUniversalIdentifiers,
        )
          ? [...readabilityParentFieldUniversalIdentifiers]
          : null,
        discoverableFieldUniversalIdentifiers,
        updatedAt: new Date().toISOString(),
      },
    ];
  });

export const buildRevertedEmailAndCalendarObjectUpdates = ({
  flatObjectMetadataMaps,
}: {
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
}): FlatObjectMetadata[] =>
  DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS.flatMap((declaration) => {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        declaration.universalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      return [];
    }

    const isReadabilityChanged = 'readability' in declaration;

    return [
      {
        ...flatObjectMetadata,
        ...(isReadabilityChanged && {
          readability: MetadataReadability.OPEN,
          readabilityParentFieldUniversalIdentifiers: null,
        }),
        discoverableFieldUniversalIdentifiers: null,
        updatedAt: new Date().toISOString(),
      },
    ];
  });
