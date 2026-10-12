import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldWidgetRelationRecordsCard } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordsCard';
import { useFieldWidgetRelationRecordsTotalCount } from '@/page-layout/widgets/field/hooks/useFieldWidgetRelationRecordsTotalCount';
import { useFieldWidgetRelationSeeAllHref } from '@/page-layout/widgets/field/hooks/useFieldWidgetRelationSeeAllHref';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';

type FieldWidgetRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
};

export const FieldWidgetRelationCard = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
}: FieldWidgetRelationCardProps) => {
  const { relationObjectMetadataNameSingular, relationFieldMetadataId } =
    fieldDefinition.metadata;

  const targetRecord = useTargetRecord();

  const { relationRecordsTotalCount } = useFieldWidgetRelationRecordsTotalCount(
    {
      recordId: targetRecord.id,
      relationFieldMetadata: fieldDefinition.metadata,
    },
  );

  const { seeAllHref } = useFieldWidgetRelationSeeAllHref({
    recordId: targetRecord.id,
    relationMetadata: fieldDefinition.metadata,
  });

  const records: ObjectRecord[] = Array.isArray(relationValue)
    ? relationValue
    : isDefined(relationValue)
      ? [relationValue]
      : [];

  return (
    <FieldWidgetRelationRecordsCard
      fieldDefinition={fieldDefinition}
      relationRecords={records.map((record) => ({
        record,
        objectNameSingular: relationObjectMetadataNameSingular,
        fieldMetadataId: relationFieldMetadataId,
      }))}
      relationRecordsTotalCount={relationRecordsTotalCount}
      seeAllHref={seeAllHref}
      isInSidePanel={isInSidePanel}
    />
  );
};
