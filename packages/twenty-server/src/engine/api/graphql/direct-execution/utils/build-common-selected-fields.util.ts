import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type BuildSelectedFieldsArgs = {
  fieldSelections: GraphqlFieldSelection[];
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

// Direct execution skips validation; such names are never schema fields and __proto__ would swap a prototype
const assertIsNotReservedFieldNameOrThrow = (fieldName: string) => {
  if (fieldName.startsWith('__') && fieldName !== '__typename') {
    throw new CommonQueryRunnerException(
      `Cannot query field "${fieldName}": names starting with "__" are reserved`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
};

const findSelectionsOfField = ({
  fieldSelections,
  fieldName,
}: {
  fieldSelections: GraphqlFieldSelection[];
  fieldName: string;
}): GraphqlFieldSelection[] =>
  fieldSelections
    .filter((fieldSelection) => fieldSelection.fieldName === fieldName)
    .flatMap(({ selections }) => selections);

// A connection selects its aggregates next to edges and its record fields under edges.node
export const buildConnectionSelectedFields = ({
  fieldSelections,
  ...metadata
}: BuildSelectedFieldsArgs): CommonSelectedFields => {
  const selectedFieldNames = fieldSelections.map(({ fieldName }) => fieldName);

  selectedFieldNames.forEach(assertIsNotReservedFieldNameOrThrow);

  return {
    ...buildRecordSelectedFields({
      fieldSelections: findSelectionsOfField({
        fieldSelections: findSelectionsOfField({
          fieldSelections,
          fieldName: 'edges',
        }),
        fieldName: 'node',
      }),
      ...metadata,
    }),
    aggregates: [...new Set(selectedFieldNames)],
  };
};

export const buildRecordSelectedFields = ({
  fieldSelections,
  flatObjectMetadata,
  ...metadataMaps
}: BuildSelectedFieldsArgs): CommonSelectedFields => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadata,
  );
  const selectedFields: CommonSelectedFields = {
    fields: {},
    aggregates: [],
    relations: {},
  };

  // Aliases sharing a field and its arguments load once, so their sub-selections are merged
  const fieldSelectionsBySelectionKey = new Map<
    string,
    GraphqlFieldSelection[]
  >();

  for (const fieldSelection of fieldSelections) {
    assertIsNotReservedFieldNameOrThrow(fieldSelection.fieldName);

    const selectionKey = computeSelectionKey(fieldSelection);

    fieldSelectionsBySelectionKey.set(selectionKey, [
      ...(fieldSelectionsBySelectionKey.get(selectionKey) ?? []),
      fieldSelection,
    ]);
  }

  for (const [
    selectionKey,
    sameKeyFieldSelections,
  ] of fieldSelectionsBySelectionKey) {
    const [{ fieldName, arguments: fieldArguments }] = sameKeyFieldSelections;
    const subFieldSelections = sameKeyFieldSelections.flatMap(
      ({ selections }) => selections,
    );
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName[fieldName],
      flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
    });
    const relationFieldMetadata =
      isDefined(fieldMetadata) &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
      !isMorphRelationHead(fieldMetadata)
        ? fieldMetadata
        : undefined;
    const relationTargetObjectMetadata = isDefined(relationFieldMetadata)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
        })
      : undefined;

    if (
      !isDefined(relationFieldMetadata) ||
      !isDefined(relationTargetObjectMetadata)
    ) {
      selectedFields.fields[selectionKey] =
        subFieldSelections.length === 0 ||
        Object.fromEntries(
          subFieldSelections.map((subFieldSelection) => [
            subFieldSelection.fieldName,
            true,
          ]),
        );

      continue;
    }

    const buildRelationSelectedFields =
      relationFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY
        ? buildConnectionSelectedFields
        : buildRecordSelectedFields;

    selectedFields.relations[selectionKey] = {
      fieldName,
      ...(Object.keys(fieldArguments).length > 0 && {
        arguments: fieldArguments,
      }),
      selectedFields: buildRelationSelectedFields({
        fieldSelections: subFieldSelections,
        flatObjectMetadata: relationTargetObjectMetadata,
        ...metadataMaps,
      }),
    };
  }

  return selectedFields;
};
