import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useUpsertRecordsInStore', () => {
  it('should insert a new recordStore when no current recordStore exists', () => {
    const recordId = 'test-record-1';

    const { result } = renderHook(
      () => {
        const recordStore = useAtomFamilyStateValue(
          recordStoreFamilyState,
          recordId,
        );
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { recordStore, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    expect(result.current.recordStore).toBeNull();

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      });
    });

    expect(result.current.recordStore).toEqual({
      id: recordId,
      __typename: 'Person',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should merge filtered partial recordStore with existing recordStore', () => {
    const recordId = 'test-record-2';

    const { result } = renderHook(
      () => {
        const recordStore = useAtomFamilyStateValue(
          recordStoreFamilyState,
          recordId,
        );
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { recordStore, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      });
    });

    expect(result.current.recordStore).toEqual({
      id: recordId,
      __typename: 'Person',
      name: 'John Doe',
      email: 'john@example.com',
    });

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'Jane Doe',
            phone: '123-456-7890',
          },
        ],
        recordGqlFields: {
          id: true,
          name: true,
        },
      });
    });

    expect(result.current.recordStore).toEqual({
      id: recordId,
      __typename: 'Person',
      name: 'Jane Doe',
      email: 'john@example.com',
    });
  });

  it('should not update when filtered values are deeply equal', () => {
    const recordId = 'test-record-3';

    const { result } = renderHook(
      () => {
        const recordStore = useAtomFamilyStateValue(
          recordStoreFamilyState,
          recordId,
        );
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { recordStore, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      });
    });

    const recordAfterFirstUpsert = result.current.recordStore;

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            phone: '123-456-7890',
          },
        ],
        recordGqlFields: {
          id: true,
          name: true,
        },
      });
    });

    expect(result.current.recordStore).toBe(recordAfterFirstUpsert);
  });

  it('should keep a richer stored relation when the selected fields are unchanged', () => {
    const recordId = 'test-record-4';

    const { result } = renderHook(
      () => {
        const recordStore = useAtomFamilyStateValue(
          recordStoreFamilyState,
          recordId,
        );
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { recordStore, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            company: {
              id: 'company-1',
              __typename: 'Company',
              name: 'Acme',
              domainName: 'acme.com',
            },
          },
        ],
      });
    });

    const recordAfterFirstUpsert = result.current.recordStore;

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [
          {
            id: recordId,
            __typename: 'Person',
            name: 'John Doe',
            company: { id: 'company-1', __typename: 'Company', name: 'Acme' },
          },
        ],
        recordGqlFields: {
          id: true,
          name: true,
          company: { id: true, name: true },
        },
      });
    });

    expect(result.current.recordStore).toBe(recordAfterFirstUpsert);
  });

  it('should keep relation aggregates until a snapshot that selects them changes them', () => {
    const recordId = 'test-record-5';

    const { result } = renderHook(
      () => {
        const recordStore = useAtomFamilyStateValue(
          recordStoreFamilyState,
          recordId,
        );
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { recordStore, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    const getCompanyRecord = (peopleConnection: RecordGqlConnection) =>
      getRecordFromRecordNode({
        recordNode: {
          id: recordId,
          __typename: 'Company',
          name: 'Acme',
          people: peopleConnection,
        },
      });

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [getCompanyRecord({ totalCount: 3, edges: [] })],
      });
    });

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [getCompanyRecord({ edges: [] })],
      });
    });

    expect(
      result.current.recordStore?.[RELATION_AGGREGATE_VALUES_RECORD_KEY],
    ).toEqual({ people: { totalCount: 3 } });

    act(() => {
      result.current.upsertRecordsInStore({
        partialRecords: [getCompanyRecord({ totalCount: 0, edges: [] })],
      });
    });

    expect(
      result.current.recordStore?.[RELATION_AGGREGATE_VALUES_RECORD_KEY],
    ).toEqual({ people: { totalCount: 0 } });
  });
});
