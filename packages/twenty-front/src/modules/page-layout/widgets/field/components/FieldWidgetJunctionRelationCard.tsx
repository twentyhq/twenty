import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { FieldWidgetRelationRecordsCard } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordsCard';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';

type FieldWidgetJunctionRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
  junctionConfig: ValidResolvedJunctionConfig;
};

export const FieldWidgetJunctionRelationCard = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
  junctionConfig,
}: FieldWidgetJunctionRelationCardProps) => {
  const junctionRelationRecords = useFieldWidgetJunctionRelationRecords({
    relationValue,
    junctionConfig,
  });

  // Detach/delete in RecordDetailRelationRecordsListItem assumes a direct
  // relation, so junction cards are forced read-only to prevent data corruption.
  return (
    <FieldWidgetRelationRecordsCard
      fieldDefinition={fieldDefinition}
      relationRecords={junctionRelationRecords.map(
        (junctionRelationRecord) => ({
          ...junctionRelationRecord,
          fieldMetadataId: '',
        }),
      )}
      isInSidePanel={isInSidePanel}
      isReadOnly
    />
  );
};
