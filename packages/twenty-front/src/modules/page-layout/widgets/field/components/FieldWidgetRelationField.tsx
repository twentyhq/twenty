import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldWidgetRelationRecordChips } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordChips';
import { isDefined } from 'twenty-shared/utils';

type FieldWidgetRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
};

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

  const relatedRecords: ObjectRecord[] = isOneToMany
    ? relationValue
    : [relationValue];

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
