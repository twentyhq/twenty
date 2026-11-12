import { isDefined } from 'twenty-shared/utils';

import { preserveApplicationLocalMetadataState } from 'src/engine/core-modules/application/application-manifest/utils/preserve-application-local-metadata-state.util';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveEffectiveFieldMetadataOptionColumns } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-effective-field-metadata-option-columns.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

type OptionRowsByFieldUniversalIdentifier = Map<
  string,
  UniversalFlatFieldMetadataOption[]
>;

const groupOptionRowsByField = (
  optionRows: (UniversalFlatFieldMetadataOption | undefined)[],
): OptionRowsByFieldUniversalIdentifier => {
  const optionRowsByField: OptionRowsByFieldUniversalIdentifier = new Map();

  for (const optionRow of optionRows) {
    if (!isDefined(optionRow)) {
      continue;
    }

    optionRowsByField.set(optionRow.fieldMetadataUniversalIdentifier, [
      ...(optionRowsByField.get(optionRow.fieldMetadataUniversalIdentifier) ??
        []),
      optionRow,
    ]);
  }

  return optionRowsByField;
};

// fieldMetadata.options is still what gets read, so a sync has to write the workspace's
// overrides, deactivations and own options back into it instead of the bare manifest.
export const keepWorkspaceOptionStateInManifestFieldOptions = ({
  toFlatFieldMetadataMapsToMutate,
  toFlatFieldMetadataOptionMaps,
  existingFlatFieldMetadataOptionMaps,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  toFlatFieldMetadataMapsToMutate: Pick<
    MetadataUniversalFlatEntityMaps<'fieldMetadata'>,
    'byUniversalIdentifier'
  >;
  toFlatFieldMetadataOptionMaps: Pick<
    MetadataUniversalFlatEntityMaps<'fieldMetadataOption'>,
    'byUniversalIdentifier'
  >;
  existingFlatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
  workspaceCustomApplicationUniversalIdentifier: string;
}): void => {
  const manifestOptionRowsByField = groupOptionRowsByField(
    Object.values(toFlatFieldMetadataOptionMaps.byUniversalIdentifier),
  );
  const existingOptionRowsByField = groupOptionRowsByField(
    Object.values(existingFlatFieldMetadataOptionMaps.byUniversalIdentifier),
  );

  for (const [fieldUniversalIdentifier, manifestOptionRows] of [
    ...manifestOptionRowsByField,
  ]) {
    const toFlatFieldMetadata =
      toFlatFieldMetadataMapsToMutate.byUniversalIdentifier[
        fieldUniversalIdentifier
      ];

    if (
      !isDefined(toFlatFieldMetadata) ||
      !isEnumUniversalFlatFieldMetadata(toFlatFieldMetadata)
    ) {
      continue;
    }

    const manifestOptionRowUniversalIdentifiers = new Set(
      manifestOptionRows.map(({ universalIdentifier }) => universalIdentifier),
    );
    const manifestOptionValues = new Set(
      manifestOptionRows.map(({ value }) => value),
    );
    const applicationOptionRows = manifestOptionRows.map(
      (manifestOptionRow) => {
        const existingOptionRow =
          existingFlatFieldMetadataOptionMaps.byUniversalIdentifier[
            manifestOptionRow.universalIdentifier
          ];

        return isDefined(existingOptionRow)
          ? preserveApplicationLocalMetadataState<UniversalFlatFieldMetadataOption>(
              {
                existingEntity: existingOptionRow,
                manifestEntity: manifestOptionRow,
              },
            )
          : manifestOptionRow;
      },
    );
    const workspaceOptionRows = (
      existingOptionRowsByField.get(fieldUniversalIdentifier) ?? []
    ).filter(
      (existingOptionRow) =>
        existingOptionRow.applicationUniversalIdentifier !==
          toFlatFieldMetadata.applicationUniversalIdentifier &&
        !manifestOptionRowUniversalIdentifiers.has(
          existingOptionRow.universalIdentifier,
        ) &&
        !manifestOptionValues.has(existingOptionRow.value),
    );
    const hasWorkspaceOptionState =
      workspaceOptionRows.length > 0 ||
      applicationOptionRows.some(
        ({ overrides, isActive }) => isDefined(overrides) || !isActive,
      );

    if (!hasWorkspaceOptionState) {
      continue;
    }

    const manifestOptionById = new Map(
      toFlatFieldMetadata.options.map((option) => [option.id, option]),
    );

    toFlatFieldMetadata.options = [
      ...applicationOptionRows,
      ...workspaceOptionRows,
    ]
      .map((optionRow) => ({
        universalIdentifier: optionRow.universalIdentifier,
        ...resolveEffectiveFieldMetadataOptionColumns({
          universalFlatFieldMetadataOption: optionRow,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      }))
      .sort(
        (firstOption, secondOption) =>
          firstOption.position - secondOption.position,
      )
      .map(
        ({ universalIdentifier, value, label, color, isActive }, position) => ({
          ...manifestOptionById.get(universalIdentifier),
          id: universalIdentifier,
          value,
          label,
          position,
          ...(isDefined(color) ? { color } : {}),
          ...(isActive ? {} : { isActive: false }),
        }),
      ) as typeof toFlatFieldMetadata.options;
  }
};
