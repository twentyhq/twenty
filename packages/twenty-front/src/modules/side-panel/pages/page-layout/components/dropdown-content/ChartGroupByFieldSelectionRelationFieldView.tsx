import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';

type ChartGroupByFieldSelectionRelationFieldViewProps = {
  relationField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  onBack: () => void;
  onSelectSubField: (subFieldName: string) => void;
};

export const ChartGroupByFieldSelectionRelationFieldView = ({
  relationField,
  currentSubFieldName,
  onBack,
  onSelectSubField,
}: ChartGroupByFieldSelectionRelationFieldViewProps) => {
  return (
    <ChartGroupByFieldSelectionTargetObjectFieldsView
      targetObjectNameSingular={
        relationField.relation?.targetObjectMetadata?.nameSingular
      }
      headerLabel={relationField.label}
      currentSubFieldName={currentSubFieldName}
      onBack={onBack}
      onSelectSubField={onSelectSubField}
    />
  );
};
