import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestFieldReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';

// Updates only report relations to a single record, through their join column.
export const computeWorkflowWatchedFieldName = (
  field: Pick<
    WorkflowManifestFieldReference,
    'name' | 'type' | 'universalSettings'
  >,
): string | undefined => {
  if (
    field.type !== FieldMetadataType.RELATION &&
    field.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return field.name;
  }

  const isManyToOneRelation =
    isDefined(field.universalSettings) &&
    'relationType' in field.universalSettings &&
    field.universalSettings.relationType === RelationType.MANY_TO_ONE;

  if (!isManyToOneRelation) {
    return undefined;
  }

  return computeMorphOrRelationFieldJoinColumnName({ name: field.name });
};
