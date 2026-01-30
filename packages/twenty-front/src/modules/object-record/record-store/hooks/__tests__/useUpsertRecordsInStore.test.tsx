import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useUpsertRecordsInStore', () => {
  it('should insert a new record when no current record exists', () => {
    const recordId = 'test-record-1';

    const { result } = renderHook(
      () => {
        const record = useRecoilValue(recordStoreFamilyState(recordId));
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { record, upsertRecordsInStore };
      },
      { wrapper: Wrapper },
    );

    expect(result.current.record).toBeNull();

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

    expect(result.current.record).toEqual({
      id: recordId,
      __typename: 'Person',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should merge filtered partial record with existing record', () => {
    const recordId = 'test-record-2';

    const { result } = renderHook(
      () => {
        const record = useRecoilValue(recordStoreFamilyState(recordId));
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { record, upsertRecordsInStore };
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

    expect(result.current.record).toEqual({
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

    expect(result.current.record).toEqual({
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
        const record = useRecoilValue(recordStoreFamilyState(recordId));
        const { upsertRecordsInStore } = useUpsertRecordsInStore();

        return { record, upsertRecordsInStore };
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

    const recordAfterFirstUpsert = result.current.record;

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

    expect(result.current.record).toBe(recordAfterFirstUpsert);
  });
});
