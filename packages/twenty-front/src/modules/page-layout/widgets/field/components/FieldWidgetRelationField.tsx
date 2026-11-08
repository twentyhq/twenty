import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldWidgetRelationRecordChips } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordChips';
import { isDefined } from 'twenty-shared/utils';

type FieldWidgetRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: unknown;
  isInSidePanel: boolean;
};

const isObjectRecord = (value: unknown): value is ObjectRecord =>
  typeof value === 'object' && value !== null;

export const FieldWidgetRelationField = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
}: FieldWidgetRelationFieldProps) => {
  const fieldMetadata = fieldDefinition.metadata;
  const isOneToMany = fieldMetadata.relationType === 'ONE_TO_MANY';
  const relationObjectNameSingular =
    fieldMetadata.relationObjectMetadataNameSingular;

  if (isOneToMany && !Array.isArray(relationValue)) {
    return null;
  }

  if (!isOneToMany && !isDefined(relationValue)) {
    return null;
  }

  const relatedRecords: ObjectRecord[] = Array.isArray(relationValue)
    ? relationValue
    : isObjectRecord(relationValue)
      ? [relationValue]
      : [];

  return (
    <FieldWidgetRelationRecordChips
      relationRecords={relatedRecords.map((record) => ({
        record,
        objectNameSingular: relationObjectNameSingular,
      }))}
      isInSidePanel={isInSidePanel}
    />
  );
};
