import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';

type ChartGroupByFieldSelectionRelationFieldViewProps = {
  relationField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  isCurrentGroupByField: boolean;
  onBack: () => void;
  onSelectSubField: (subFieldName: string) => void;
  onSelectRecord: () => void;
};

export const ChartGroupByFieldSelectionRelationFieldView = ({
  relationField,
  currentSubFieldName,
  isCurrentGroupByField,
  onBack,
  onSelectSubField,
  onSelectRecord,
}: ChartGroupByFieldSelectionRelationFieldViewProps) => {
  return (
    <ChartGroupByFieldSelectionTargetObjectFieldsView
      targetObjectNameSingular={
        relationField.relation?.targetObjectMetadata?.nameSingular
      }
      headerLabel={relationField.label}
      currentSubFieldName={currentSubFieldName}
      isCurrentGroupByField={isCurrentGroupByField}
      onBack={onBack}
      onSelectSubField={onSelectSubField}
      onSelectRecord={onSelectRecord}
    />
  );
};
