import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
  FieldMetadataDefaultValueForAnyType,
  FieldMetadataType,
} from 'twenty-shared/types';

import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/core-modules/application/constants/get-standard-field-metadata-id-by-object-and-field-name.util';
import { STANDARD_OBJECTS } from 'src/engine/core-modules/application/constants/standard-object.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/core-modules/application/constants/twenty-standard-applications';
import { AllStandardObjectFieldName } from 'src/engine/core-modules/application/types/all-standard-object-field-name.type';
import { AllStandardObjectName } from 'src/engine/core-modules/application/types/all-standard-object-name.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

export type CreateStandardRelationFieldOptions<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  fieldName: AllStandardObjectFieldName<O>;
  label: string;
  description: string;
  icon: string;
  targetObjectName: T;
  targetFieldName: AllStandardObjectFieldName<T>;
  isSystem?: boolean;
  isNullable?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings?: Record<string, unknown> | null;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
  createdAt: Date;
};

export type CreateStandardRelationFieldArgs<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  objectName: O;
  workspaceId: string;
  options: CreateStandardRelationFieldOptions<O, T>;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

export const createStandardRelationFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
>({
  objectName,
  workspaceId,
  options,
  standardFieldMetadataIdByObjectAndFieldName,
}: CreateStandardRelationFieldArgs<O, T>): FlatFieldMetadata => {
  const {
    fieldName,
    label,
    description,
    icon,
    targetObjectName,
    targetFieldName,
    isSystem = false,
    isNullable = true,
    isUIReadOnly = false,
    defaultValue = null,
    settings = null,
    options: fieldOptions = null,
    createdAt,
  } = options;

  const objectFields = STANDARD_OBJECTS[objectName].fields;
  const fieldDefinition = objectFields[fieldName as keyof typeof objectFields];
  const fieldIds =
    standardFieldMetadataIdByObjectAndFieldName[objectName].fields;

  const targetFieldIds =
    standardFieldMetadataIdByObjectAndFieldName[targetObjectName].fields;

  return {
    id: fieldIds[fieldName as keyof typeof fieldIds],
    universalIdentifier: fieldDefinition.universalIdentifier,
    standardId: null,
    applicationId: TWENTY_STANDARD_APPLICATION_ID,
    workspaceId,
    objectMetadataId:
      standardFieldMetadataIdByObjectAndFieldName[objectName].id,
    type: FieldMetadataType.RELATION,
    name: fieldName.toString(),
    label,
    description,
    icon,
    isCustom: false,
    isActive: true,
    isSystem,
    isNullable,
    isUnique: false,
    isUIReadOnly,
    isLabelSyncedWithName: false,
    standardOverrides: null,
    defaultValue,
    settings,
    options: fieldOptions,
    relationTargetFieldMetadataId: targetFieldIds[targetFieldName],
    relationTargetObjectMetadataId:
      standardFieldMetadataIdByObjectAndFieldName[targetObjectName].id,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    viewGroupIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt,
    updatedAt: createdAt,
  };
};
