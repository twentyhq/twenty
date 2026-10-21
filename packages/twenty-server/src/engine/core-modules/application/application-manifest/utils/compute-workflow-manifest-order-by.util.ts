import {
  getOrderByForFieldMetadataType,
  getOrderByForRelationField,
} from 'twenty-shared/utils';
import {
  FieldMetadataType,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';

export const computeWorkflowManifestOrderBy = ({
  field,
  direction,
  subFieldName,
  references,
}: {
  field: WorkflowManifestFieldReference;
  direction: 'ASC' | 'DESC';
  subFieldName?: string | null;
  references: WorkflowManifestReferences;
}): RecordGqlOperationOrderBy => {
  const orderByDirection =
    direction === 'ASC' ? 'AscNullsLast' : 'DescNullsLast';
  if (field.type === FieldMetadataType.RELATION) {
    const target = references.objectByUniversalIdentifier?.get(
      field.relationTargetObjectMetadataUniversalIdentifier ?? '',
    );
    const labelIdentifierField = references.fieldByUniversalIdentifier?.get(
      target?.labelIdentifierFieldMetadataUniversalIdentifier ?? '',
    );
    return getOrderByForRelationField({
      field,
      labelIdentifierField:
        labelIdentifierField?.type === FieldMetadataType.RELATION
          ? undefined
          : labelIdentifierField,
      orderByDirection,
    });
  }
  return getOrderByForFieldMetadataType({
    field,
    orderByDirection,
    primaryCompositeSubField: subFieldName,
  });
};
