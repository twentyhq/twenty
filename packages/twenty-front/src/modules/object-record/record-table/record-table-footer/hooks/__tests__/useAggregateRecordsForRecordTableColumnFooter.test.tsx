import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import { renderHook } from '@testing-library/react';

const VIEW_FILTER = { stage: { in: ['NEW', 'WON'] } };
const RECORD_GROUP_FILTER = { stage: { eq: 'WON' } };
const ADDITIONAL_FILTER = { closeDate: { gte: '2026-01-01' } };

const mockUseAggregateRecords = jest.fn();
let mockAdditionalFilter = {};

jest.mock('@/object-record/hooks/useAggregateRecords', () => ({
  useAggregateRecords: (args: unknown) => {
    mockUseAggregateRecords(args);

    return { data: {}, loading: false, refetch: jest.fn() };
  },
}));
jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexAdditionalFilter',
  () => ({ useRecordIndexAdditionalFilter: () => mockAdditionalFilter }),
);
jest.mock('@/object-record/record-table/contexts/RecordTableContext', () => ({
  useRecordTableContextOrThrow: () => ({
    objectMetadataItem: {
      nameSingular: 'opportunity',
      fields: [],
      readableFields: [],
    },
  }),
}));
jest.mock('@/object-record/record-group/hooks/useRecordGroupFilter', () => ({
  useRecordGroupFilter: () => ({ recordGroupFilter: RECORD_GROUP_FILTER }),
}));
jest.mock('@/localization/hooks/useNumberFormat', () => ({
  useNumberFormat: () => ({ numberFormat: {}, formatNumber: String }),
}));
jest.mock(
  '@/object-record/record-table-widget/hooks/useListenToJunctionRecordOperation',
  () => ({ useListenToJunctionRecordOperation: () => undefined }),
);
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({ filterValueDependencies: {} }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => [] }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => undefined,
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ localeCatalog: {} }),
}));
jest.mock('twenty-shared/utils', () => ({
  ...jest.requireActual('twenty-shared/utils'),
  computeRecordGqlOperationFilter: () => VIEW_FILTER,
  turnAnyFieldFilterIntoRecordGqlFilter: () => ({
    recordGqlOperationFilter: {},
  }),
}));

const getSentFilter = () => mockUseAggregateRecords.mock.lastCall?.[0].filter;

describe('useAggregateRecordsForRecordTableColumnFooter', () => {
  beforeEach(() => {
    mockUseAggregateRecords.mockClear();
    mockAdditionalFilter = {};
  });

  it('should keep the view filter when the record group filters the same field', () => {
    renderHook(() => useAggregateRecordsForRecordTableColumnFooter('amount'));

    expect(getSentFilter()).toEqual({
      and: [VIEW_FILTER, RECORD_GROUP_FILTER],
    });
  });

  it('should AND the record index additional filter', () => {
    mockAdditionalFilter = ADDITIONAL_FILTER;

    renderHook(() => useAggregateRecordsForRecordTableColumnFooter('amount'));

    expect(getSentFilter()).toEqual({
      and: [VIEW_FILTER, RECORD_GROUP_FILTER, ADDITIONAL_FILTER],
    });
  });
});
