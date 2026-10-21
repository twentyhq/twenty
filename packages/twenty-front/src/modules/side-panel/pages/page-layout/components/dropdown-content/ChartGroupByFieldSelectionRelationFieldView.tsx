import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';

type ChartGroupByFieldSelectionRelationFieldViewProps = {
  pageId: string;
  relationField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  isCurrentGroupByField: boolean;
  onSelectSubField: (subFieldName: string) => void;
  onSelectRecord: () => void;
};

export const ChartGroupByFieldSelectionRelationFieldView = ({
  pageId,
  relationField,
  currentSubFieldName,
  isCurrentGroupByField,
  onSelectSubField,
  onSelectRecord,
}: ChartGroupByFieldSelectionRelationFieldViewProps) => {
  return (
    <ChartGroupByFieldSelectionTargetObjectFieldsView
      pageId={pageId}
      targetObjectNameSingular={
        relationField.relation?.targetObjectMetadata?.nameSingular
      }
      headerLabel={relationField.label}
      currentSubFieldName={currentSubFieldName}
      isCurrentGroupByField={isCurrentGroupByField}
      onSelectSubField={onSelectSubField}
      onSelectRecord={onSelectRecord}
    />
  );
};
