import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getRelationAggregateOperations } from '@/object-record/record-column-aggregate/utils/getRelationAggregateOperations';
import { getRelationTargetFieldMetadataItems } from '@/object-record/record-field/utils/getRelationTargetFieldMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { RecordTableRelationTargetFieldSelectMenu } from '@/object-record/record-table/record-table-header/components/RecordTableRelationTargetFieldSelectMenu';
import { type RecordTableRelationColumnTarget } from '@/object-record/record-table/utils/buildRecordTableRelationColumn';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

const isAggregatableFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
) => isNonEmptyArray(getRelationAggregateOperations(fieldMetadataItem));

type RecordTableAggregateColumnPagesProps = {
  pageId: string;
  relationFieldMetadataItem: FieldMetadataItem;
  onSelect: (relationColumnTarget: RecordTableRelationColumnTarget) => void;
  children?: ReactNode;
};

export const RecordTableAggregateColumnPages = ({
  pageId,
  relationFieldMetadataItem,
  onSelect,
  children,
}: RecordTableAggregateColumnPagesProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItems,
  });

  const aggregatedFieldMetadataItems = isDefined(relationObjectMetadataItem)
    ? getRelationTargetFieldMetadataItems({
        relationObjectMetadataItem,
        isEligible: isAggregatableFieldMetadataItem,
      })
    : [];

  const getOperationPageId = (aggregatedFieldMetadataItem: FieldMetadataItem) =>
    `${pageId}-${aggregatedFieldMetadataItem.id}`;

  return (
    <>
      <RecordTableRelationTargetFieldSelectMenu
        pageId={pageId}
        relationFieldMetadataItem={relationFieldMetadataItem}
        fieldMetadataItems={aggregatedFieldMetadataItems}
        getFieldItemProps={(aggregatedFieldMetadataItem) => ({
          page: getOperationPageId(aggregatedFieldMetadataItem),
        })}
      >
        {children}
        <Dropdown.Section scrollable={false}>
          <Dropdown.ActionItem
            onClick={() =>
              onSelect({
                relationAggregateOperation: AggregateOperations.COUNT,
              })
            }
            startIcon={
              <SelectOptionIcon
                Icon={getIcon(relationFieldMetadataItem.icon)}
              />
            }
          >{t`Count`}</Dropdown.ActionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
      </RecordTableRelationTargetFieldSelectMenu>
      {aggregatedFieldMetadataItems.map((aggregatedFieldMetadataItem) => (
        <Dropdown.Page
          key={aggregatedFieldMetadataItem.id}
          id={getOperationPageId(aggregatedFieldMetadataItem)}
        >
          <Dropdown.Back
            aria-label={t`${aggregatedFieldMetadataItem.label}, back to fields`}
          >
            {aggregatedFieldMetadataItem.label}
          </Dropdown.Back>
          <Dropdown.Separator />
          <Dropdown.Section>
            {getRelationAggregateOperations(aggregatedFieldMetadataItem).map(
              (aggregateOperation) => (
                <Dropdown.ActionItem
                  key={aggregateOperation}
                  onClick={() =>
                    onSelect({
                      relationTargetFieldMetadataId:
                        aggregatedFieldMetadataItem.id,
                      relationAggregateOperation: aggregateOperation,
                    })
                  }
                >
                  {getAggregateOperationLabel(
                    convertAggregateOperationToExtendedAggregateOperation(
                      aggregateOperation,
                      aggregatedFieldMetadataItem.type,
                    ),
                  )}
                </Dropdown.ActionItem>
              ),
            )}
          </Dropdown.Section>
        </Dropdown.Page>
      ))}
    </>
  );
};
