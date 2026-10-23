import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartGroupByFieldSelectionTargetObjectFieldsView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionTargetObjectFieldsView';

type ChartGroupByFieldSelectionRelationFieldViewProps = {
  pageId: string;
  relationField: FieldMetadataItem;
};

export const ChartGroupByFieldSelectionRelationFieldView = ({
  pageId,
  relationField,
}: ChartGroupByFieldSelectionRelationFieldViewProps) => {
  return (
    <ChartGroupByFieldSelectionTargetObjectFieldsView
      pageId={pageId}
      targetObjectNameSingular={
        relationField.relation?.targetObjectMetadata?.nameSingular
      }
      headerLabel={relationField.label}
      fieldMetadataId={relationField.id}
    />
  );
};
