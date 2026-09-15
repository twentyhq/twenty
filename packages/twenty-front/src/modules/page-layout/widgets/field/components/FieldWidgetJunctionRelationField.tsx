import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { FieldWidgetRelationRecordChips } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordChips';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';

type FieldWidgetJunctionRelationFieldProps = {
  relationValue: any;
  isInSidePanel: boolean;
  junctionConfig: ValidResolvedJunctionConfig;
};

export const FieldWidgetJunctionRelationField = ({
  relationValue,
  isInSidePanel,
  junctionConfig,
}: FieldWidgetJunctionRelationFieldProps) => {
  const junctionRelationRecords = useFieldWidgetJunctionRelationRecords({
    relationValue,
    junctionConfig,
  });

  if (junctionRelationRecords.length === 0) {
    return null;
  }

  return (
    <FieldWidgetRelationRecordChips
      relationRecords={junctionRelationRecords}
      isInSidePanel={isInSidePanel}
    />
  );
};
