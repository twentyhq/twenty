import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE } from '@/object-record/record-column-aggregate/constants/RelationAggregateOperationsByFieldType';
import { getAggregatedFieldMetadataItems } from '@/object-record/record-column-aggregate/utils/getAggregatedFieldMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type RecordTableRelationColumnTarget } from '@/object-record/record-table/utils/buildRecordTableRelationColumn';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

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
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItems,
  });

  const aggregatedFieldMetadataItems = isDefined(relationObjectMetadataItem)
    ? getAggregatedFieldMetadataItems(relationObjectMetadataItem)
    : [];

  const filteredAggregatedFieldMetadataItems =
    aggregatedFieldMetadataItems.filter(({ label }) =>
      label.toLowerCase().includes(searchInput.toLowerCase()),
    );

  const getOperationPageId = (aggregatedFieldMetadataItem: FieldMetadataItem) =>
    `${pageId}-${aggregatedFieldMetadataItem.id}`;

  return (
    <>
      <Dropdown.Page id={pageId}>
        <Dropdown.Back
          aria-label={t`${relationFieldMetadataItem.label}, back to fields`}
        >
          {relationFieldMetadataItem.label}
        </Dropdown.Back>
        <Dropdown.Search
          value={searchInput}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setSearchInput}
        />
        <Dropdown.Separator />
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
        <Dropdown.Section scrollable>
          {isNonEmptyArray(filteredAggregatedFieldMetadataItems) ? (
            filteredAggregatedFieldMetadataItems.map(
              (aggregatedFieldMetadataItem) => (
                <Dropdown.ActionItem
                  key={aggregatedFieldMetadataItem.id}
                  page={getOperationPageId(aggregatedFieldMetadataItem)}
                  startIcon={
                    <SelectOptionIcon
                      Icon={getIcon(aggregatedFieldMetadataItem.icon)}
                    />
                  }
                >
                  {aggregatedFieldMetadataItem.label}
                </Dropdown.ActionItem>
              ),
            )
          ) : (
            <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Page>
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
            {(
              RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE[
                aggregatedFieldMetadataItem.type
              ] ?? []
            ).map((aggregateOperation) => (
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
            ))}
          </Dropdown.Section>
        </Dropdown.Page>
      ))}
    </>
  );
};
