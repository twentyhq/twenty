import {
  getFieldUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const ENGINE_FIELD_NAMES = [
  'id',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
  'deletedAt',
  'position',
  'searchVector',
];

export const getUnresolvedLabelIdentifierWarnings = (
  manifest: Manifest,
): string[] =>
  manifest.objects.flatMap((object) => {
    const identifier =
      object.labelIdentifierFieldMetadataUniversalIdentifier?.toLowerCase();

    if (!isDefined(identifier)) return [];

    const knownIdentifiers = [
      ...(object.fields ?? []).map((field) =>
        field.universalIdentifier.toLowerCase(),
      ),
      ...manifest.fields
        .filter(
          (field) =>
            field.objectUniversalIdentifier.toLowerCase() ===
            object.universalIdentifier.toLowerCase(),
        )
        .map((field) => field.universalIdentifier.toLowerCase()),
      ...ENGINE_FIELD_NAMES.map((name) =>
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            manifest.application.universalIdentifier,
          objectUniversalIdentifier: object.universalIdentifier,
          name,
        }),
      ),
    ];

    return knownIdentifiers.includes(identifier)
      ? []
      : [
          `Object "${object.nameSingular}" references label field ${identifier}, which is not declared in this app or a recognized generated field. Check the identifier; the server must resolve this reference before applying.`,
        ];
  });
