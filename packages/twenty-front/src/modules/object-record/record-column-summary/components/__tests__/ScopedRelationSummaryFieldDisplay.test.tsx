import { ScopedRelationSummaryFieldDisplay } from '@/object-record/record-column-summary/components/ScopedRelationSummaryFieldDisplay';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { UserContext } from '@/users/contexts/UserContext';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const RECORD_ID = 'company-id';
const RESPONSE_KEY = 'opportunities_0123456789abcdef';

const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
  fieldName: 'amount',
});

const SUM_OF_AMOUNT: RecordFieldSummary = {
  aggregateOperation: AggregateOperations.SUM,
  aggregatedFieldMetadataItem: amountField,
  aggregateGqlFieldName: 'sumAmountAmountMicros',
  isAggregatedFieldReadable: true,
};

const COUNT: RecordFieldSummary = {
  aggregateOperation: AggregateOperations.COUNT,
  aggregateGqlFieldName: 'totalCount',
  isAggregatedFieldReadable: true,
};

const renderSummary = ({
  summary,
  aggregateValues,
}: {
  summary: RecordFieldSummary;
  aggregateValues: Record<string, unknown>;
}) => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    id: RECORD_ID,
    __typename: 'Company',
    ...aggregateValues,
  });

  return render(
    <JotaiProvider store={store}>
      <UserContext.Provider
        value={{
          dateFormat: DateFormat.MONTH_FIRST,
          timeFormat: TimeFormat.HOUR_24,
          timeZone: 'UTC',
        }}
      >
        <FieldContext.Provider
          value={{
            recordId: RECORD_ID,
            fieldDefinition: textfieldDefinition,
            isLabelIdentifier: false,
            isRecordFieldReadOnly: true,
          }}
        >
          <ScopedRelationSummaryFieldDisplay
            responseKey={RESPONSE_KEY}
            summary={summary}
          />
        </FieldContext.Provider>
      </UserContext.Provider>
    </JotaiProvider>,
  );
};

describe('ScopedRelationSummaryFieldDisplay', () => {
  it('shows the count of the related records', () => {
    renderSummary({
      summary: COUNT,
      aggregateValues: { [`${RESPONSE_KEY}TotalCount`]: 3 },
    });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows a sum of amounts like the table totals', () => {
    renderSummary({
      summary: SUM_OF_AMOUNT,
      aggregateValues: {
        [`${RESPONSE_KEY}SumAmountAmountMicros`]: 1_500_000_000,
      },
    });

    expect(screen.getByText('1.5k')).toBeInTheDocument();
  });

  it('shows nothing when no related record has a value', () => {
    const { container } = renderSummary({
      summary: SUM_OF_AMOUNT,
      aggregateValues: { [`${RESPONSE_KEY}SumAmountAmountMicros`]: null },
    });

    expect(container).toBeEmptyDOMElement();
  });
});
