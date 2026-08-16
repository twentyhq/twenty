// SOURCING: twentyhq/twenty RecordListBody (PR #23829) — fork-local RELATIONS table
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { RecordRelationsRow } from '@/object-record/record-relations/components/RecordRelationsRow';
import { RECORD_RELATIONS_ALSO_LINKED_FROM_COLUMN_ID } from '@/object-record/record-relations/constants/RecordRelationsAlsoLinkedFromColumnId';
import { useRecordRelationsContextOrThrow } from '@/object-record/record-relations/contexts/RecordRelationsContext';
import { computeAlsoLinkedFrom } from '@/object-record/record-relations/utils/computeAlsoLinkedFrom';
import { getObjectRelationFields } from '@/object-record/record-relations/utils/getObjectRelationFields';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  white-space: nowrap;
`;

const StyledSortableHeader = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
`;

type AlsoLinkedFromSort = 'none' | 'desc' | 'asc';

export const RecordRelationsBody = () => {
  const { objectNameSingular, objectMetadataItem } =
    useRecordRelationsContextOrThrow();
  const { labelIdentifierFieldMetadataItem, fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [alsoLinkedFromSort, setAlsoLinkedFromSort] =
    useState<AlsoLinkedFromSort>('none');

  const relationFields = useMemo(
    () => getObjectRelationFields(objectMetadataItem),
    [objectMetadataItem],
  );

  const scalarRecordFields = visibleRecordFields.filter((recordField) => {
    const field =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

    return (
      field?.id !== labelIdentifierFieldMetadataItem?.id &&
      field?.type !== FieldMetadataType.RELATION &&
      field?.type !== FieldMetadataType.MORPH_RELATION
    );
  });

  const alsoLinkedFromByRecordId = useMemo(
    () => computeAlsoLinkedFrom(records, relationFields),
    [records, relationFields],
  );

  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );

  const orderedRecords = useMemo(() => {
    if (alsoLinkedFromSort === 'none') {
      return records;
    }

    return [...records].sort((left, right) => {
      const leftCount = alsoLinkedFromByRecordId.get(left.id)?.length ?? 0;
      const rightCount = alsoLinkedFromByRecordId.get(right.id)?.length ?? 0;
      return alsoLinkedFromSort === 'desc'
        ? rightCount - leftCount
        : leftCount - rightCount;
    });
  }, [alsoLinkedFromSort, alsoLinkedFromByRecordId, records]);

  const label = labelIdentifierFieldMetadataItem?.label ?? t`Record`;

  return (
    <>
      <RecordListUpsertRecordsInStoreEffect records={records} />
      {!error && (
        <StyledTable>
          <thead>
            <tr>
              <StyledHeaderCell />
              <StyledHeaderCell>{label}</StyledHeaderCell>
              {relationFields.map((field) => (
                <StyledHeaderCell key={field.id}>{field.label}</StyledHeaderCell>
              ))}
              {scalarRecordFields.map((recordField) => {
                const field =
                  fieldMetadataItemByFieldMetadataItemId[
                    recordField.fieldMetadataItemId
                  ];

                return (
                  <StyledHeaderCell key={recordField.id}>
                    {field?.label ?? ''}
                  </StyledHeaderCell>
                );
              })}
              <StyledHeaderCell id={RECORD_RELATIONS_ALSO_LINKED_FROM_COLUMN_ID}>
                <StyledSortableHeader
                  type="button"
                  onClick={() =>
                    setAlsoLinkedFromSort((current) =>
                      current === 'none'
                        ? 'desc'
                        : current === 'desc'
                          ? 'asc'
                          : 'none',
                    )
                  }
                >
                  {t`Also linked from`}
                </StyledSortableHeader>
              </StyledHeaderCell>
            </tr>
          </thead>
          <tbody>
            {orderedRecords.map((record) => (
              <RecordRelationsRow
                key={record.id}
                recordId={record.id}
                relationFields={relationFields}
                scalarRecordFields={scalarRecordFields}
                alsoLinkedFromHits={
                  alsoLinkedFromByRecordId.get(record.id) ?? []
                }
                recordsById={recordsById}
                expanded={expandedRecordIds.has(record.id)}
                onToggleExpanded={() =>
                  setExpandedRecordIds((current) => {
                    const next = new Set(current);
                    if (next.has(record.id)) {
                      next.delete(record.id);
                    } else {
                      next.add(record.id);
                    }
                    return next;
                  })
                }
              />
            ))}
          </tbody>
        </StyledTable>
      )}
      {hasNextPage && !loading && (
        <button type="button" onClick={() => fetchMoreRecords()}>
          {t`Load more`}
        </button>
      )}
    </>
  );
};
