import { RelationType } from 'twenty-shared/types';
import { isFieldMetadataSupportedInGroupBy } from 'twenty-shared/utils';

import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const getWorkspaceApiObjectFieldBindings = ({
  fields,
  view,
}: {
  fields: FlatFieldMetadata[];
  view: WorkspaceApiNamingView;
}): {
  node: Record<string, string>;
  input: Record<string, string>;
  relationInput: Record<string, string>;
  groupBy: Record<string, string>;
} => {
  const node: Record<string, string> = {};
  const input: Record<string, string> = {};
  const relationInput: Record<string, string> = {};
  const groupBy: Record<string, string> = {};

  for (const fieldMetadata of fields) {
    const apiName =
      view.fields[fieldMetadata.universalIdentifier] ?? fieldMetadata.name;
    const isRelation = isMorphOrRelationFlatFieldMetadata(fieldMetadata);
    const isToManyRelation =
      isRelation &&
      fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY;
    const isToOneRelation =
      isRelation &&
      fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

    node[apiName] = fieldMetadata.name;

    if (isToManyRelation) {
      continue;
    }

    input[apiName] = fieldMetadata.name;

    if (isFieldMetadataSupportedInGroupBy(fieldMetadata)) {
      groupBy[apiName] = fieldMetadata.name;
    }

    if (!isToOneRelation) {
      continue;
    }

    const apiJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: apiName,
    });
    const canonicalJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: fieldMetadata.name,
    });

    node[apiJoinColumnName] = canonicalJoinColumnName;
    input[apiJoinColumnName] = canonicalJoinColumnName;
    relationInput[apiName] = fieldMetadata.name;
    relationInput[apiJoinColumnName] = canonicalJoinColumnName;
  }

  return { node, input, relationInput, groupBy };
};
