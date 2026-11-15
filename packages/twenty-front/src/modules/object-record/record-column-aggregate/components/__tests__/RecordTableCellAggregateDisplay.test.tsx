import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { RecordTableCellAggregateDisplay } from '@/object-record/record-column-aggregate/components/RecordTableCellAggregateDisplay';
import { getRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const RECORD_ID = 'company-1';

const company = getMockObjectMetadataItemOrThrow('company');
const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
  fieldName: 'amount',
});

const getAggregateTarget = ({
  fieldName,
  recordField,
}: {
  fieldName: string;
  recordField: Pick<
    RecordField,
    'relationAggregateOperation' | 'relationTargetFieldMetadataId'
  >;
}) => {
  const aggregateTarget = getRecordFieldAggregateTarget({
    recordField,
    fieldMetadataItem: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: company,
      fieldName,
    }),
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
  });

  if (aggregateTarget === undefined) {
    throw new Error('Aggregate target not found');
  }

  return aggregateTarget;
};

const renderAggregateDisplay = (
  aggregateTarget: ReturnType<typeof getAggregateTarget>,
) => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    id: RECORD_ID,
    __typename: 'Company',
    [RELATION_AGGREGATE_VALUES_RECORD_KEY]: {
      people: { totalCount: 3 },
      opportunities: { sumAmountAmountMicros: 1_500_000_000 },
    },
  });

  return render(
    <JotaiProvider store={store}>
      <RecordTableRowContextProvider
        value={{
          recordId: RECORD_ID,
          objectNameSingular: 'company',
          pathToShowPage: '',
          isSelected: false,
          restrictedFieldNames: [],
        }}
      >
        <RecordTableCellAggregateDisplay aggregateTarget={aggregateTarget} />
      </RecordTableRowContextProvider>
    </JotaiProvider>,
  );
};

describe('RecordTableCellAggregateDisplay', () => {
  it('shows the number of related records', () => {
    renderAggregateDisplay(
      getAggregateTarget({
        fieldName: 'people',
        recordField: {
          relationAggregateOperation: AggregateOperations.COUNT,
        },
      }),
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows a currency total from its micros', () => {
    renderAggregateDisplay(
      getAggregateTarget({
        fieldName: 'opportunities',
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: amountField.id,
        },
      }),
    );

    expect(screen.getByText('1.5k')).toBeInTheDocument();
  });

  it('stays empty when the aggregate has no value', () => {
    const { container } = renderAggregateDisplay(
      getAggregateTarget({
        fieldName: 'opportunities',
        recordField: {
          relationAggregateOperation: AggregateOperations.AVG,
          relationTargetFieldMetadataId: amountField.id,
        },
      }),
    );

    expect(container).toHaveTextContent(/^$/);
  });
});
