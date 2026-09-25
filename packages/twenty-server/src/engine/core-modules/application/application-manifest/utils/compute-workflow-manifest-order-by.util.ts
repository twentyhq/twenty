import { isDefined } from 'twenty-shared/utils';
import { DEFAULT_VISIBLE_ADDRESS_SUBFIELDS } from 'twenty-shared/constants';
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
  const order = direction === 'ASC' ? 'AscNullsLast' : 'DescNullsLast';
  if (field.type === FieldMetadataType.RELATION) {
    const target = references.objectByUniversalIdentifier?.get(
      field.relationTargetObjectMetadataUniversalIdentifier ?? '',
    );
    const label = references.fieldByUniversalIdentifier?.get(
      target?.labelIdentifierFieldMetadataUniversalIdentifier ?? '',
    );
    if (!isDefined(label) || label.type === FieldMetadataType.RELATION) {
      return [{ [`${field.name}Id`]: order }];
    }
    return computeWorkflowManifestOrderBy({
      field: label,
      direction,
      references,
    }).map((entry) => ({ [field.name]: entry }));
  }
  if (field.type === FieldMetadataType.FULL_NAME) {
    const primary = subFieldName === 'lastName' ? 'lastName' : 'firstName';
    const secondary = primary === 'firstName' ? 'lastName' : 'firstName';
    return [
      { [field.name]: { [primary]: order } },
      { [field.name]: { [secondary]: order } },
    ];
  }
  if (field.type === FieldMetadataType.ADDRESS) {
    const enabled =
      field.settings &&
      'subFields' in field.settings &&
      field.settings.subFields?.length
        ? field.settings.subFields
        : DEFAULT_VISIBLE_ADDRESS_SUBFIELDS;
    const requested = enabled.find((name) => name === subFieldName);
    const primary =
      requested ??
      enabled.find((name) => name === 'addressCity') ??
      enabled[0] ??
      'addressCity';
    return [{ [field.name]: { [primary]: order } }];
  }
  const compositeSubFields: Partial<Record<FieldMetadataType, string>> = {
    [FieldMetadataType.CURRENCY]: 'amountMicros',
    [FieldMetadataType.ACTOR]: 'name',
    [FieldMetadataType.LINKS]: 'primaryLinkUrl',
    [FieldMetadataType.EMAILS]: 'primaryEmail',
    [FieldMetadataType.PHONES]: 'primaryPhoneNumber',
  };
  const compositeSubField = compositeSubFields[field.type];
  return [
    {
      [field.name]: isDefined(compositeSubField)
        ? { [compositeSubField]: order }
        : order,
    },
  ];
};
