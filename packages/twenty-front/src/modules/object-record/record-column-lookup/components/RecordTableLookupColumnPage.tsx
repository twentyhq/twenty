import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationTargetFieldMetadataItems } from '@/object-record/record-field/utils/getRelationTargetFieldMetadataItems';
import { RecordTableRelationTargetFieldSelectMenu } from '@/object-record/record-table/record-table-header/components/RecordTableRelationTargetFieldSelectMenu';
import { type RecordTableRelationColumnTarget } from '@/object-record/record-table/utils/buildRecordTableRelationColumn';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A lookup shows one value of the related record, never another relation
const isLookupTargetFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.type !== FieldMetadataType.RELATION &&
  fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION;

type RecordTableLookupColumnPageProps = {
  pageId: string;
  relationFieldMetadataItem: FieldMetadataItem;
  onSelect: (relationColumnTarget: RecordTableRelationColumnTarget) => void;
  children?: ReactNode;
};

export const RecordTableLookupColumnPage = ({
  pageId,
  relationFieldMetadataItem,
  onSelect,
  children,
}: RecordTableLookupColumnPageProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItems,
  });

  return (
    <RecordTableRelationTargetFieldSelectMenu
      pageId={pageId}
      relationFieldMetadataItem={relationFieldMetadataItem}
      fieldMetadataItems={
        isDefined(relationObjectMetadataItem)
          ? getRelationTargetFieldMetadataItems({
              relationObjectMetadataItem,
              isEligible: isLookupTargetFieldMetadataItem,
            })
          : []
      }
      getFieldItemProps={(lookupTargetFieldMetadataItem) => ({
        onClick: () =>
          onSelect({
            relationTargetFieldMetadataId: lookupTargetFieldMetadataItem.id,
          }),
      })}
    >
      {children}
    </RecordTableRelationTargetFieldSelectMenu>
  );
};
