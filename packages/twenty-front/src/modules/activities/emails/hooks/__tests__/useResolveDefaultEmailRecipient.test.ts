import { renderHook } from '@testing-library/react';

import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const mockUseFindOneRecord = jest.fn();
const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (args: unknown) => mockUseFindOneRecord(args),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: unknown) => mockUseFindManyRecords(args),
}));

describe('useResolveDefaultEmailRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFindOneRecord.mockReturnValue({
      record: null,
      loading: false,
    });
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      loading: false,
    });
  });

  it('should return the person primary email for a Person record', () => {
    mockUseFindOneRecord.mockImplementation(
      (args: { objectNameSingular: string }) => {
        if (args.objectNameSingular === CoreObjectNameSingular.Person) {
          return {
            record: { emails: { primaryEmail: 'person@example.com' } },
            loading: false,
          };
        }

        return { record: null, loading: false };
      },
    );

    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Person,
        recordId: 'person-id',
      }),
    );

    expect(result.current.defaultTo).toBe('person@example.com');
    expect(result.current.loading).toBe(false);
  });

  it('should return the first company employee email for a Company record', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [{ emails: { primaryEmail: 'employee@company.com' } }],
      loading: false,
    });

    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: 'company-id',
      }),
    );

    expect(result.current.defaultTo).toBe('employee@company.com');
  });

  it('should return the opportunity point of contact email', () => {
    mockUseFindOneRecord.mockImplementation(
      (args: { objectNameSingular: string }) => {
        if (args.objectNameSingular === CoreObjectNameSingular.Opportunity) {
          return {
            record: {
              pointOfContact: {
                emails: { primaryEmail: 'contact@opp.com' },
              },
            },
            loading: false,
          };
        }

        return { record: null, loading: false };
      },
    );

    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'opp-id',
      }),
    );

    expect(result.current.defaultTo).toBe('contact@opp.com');
  });

  it('should return empty string for unknown object types', () => {
    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: 'customObject',
        recordId: 'some-id',
      }),
    );

    expect(result.current.defaultTo).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('should return empty string when recordId is null', () => {
    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Person,
        recordId: null,
      }),
    );

    expect(result.current.defaultTo).toBe('');
  });

  it('should report loading when the relevant query is in flight', () => {
    mockUseFindOneRecord.mockImplementation(
      (args: { objectNameSingular: string }) => {
        if (args.objectNameSingular === CoreObjectNameSingular.Person) {
          return { record: null, loading: true };
        }

        return { record: null, loading: false };
      },
    );

    const { result } = renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Person,
        recordId: 'person-id',
      }),
    );

    expect(result.current.loading).toBe(true);
  });

  it('should pass skip=true to queries for non-matching object types', () => {
    renderHook(() =>
      useResolveDefaultEmailRecipient({
        objectNameSingular: CoreObjectNameSingular.Person,
        recordId: 'person-id',
      }),
    );

    // Person query should NOT be skipped
    const personCall = mockUseFindOneRecord.mock.calls.find(
      (call: { objectNameSingular: string }[]) =>
        call[0].objectNameSingular === CoreObjectNameSingular.Person,
    );

    expect(personCall?.[0].skip).toBe(false);

    // Opportunity query SHOULD be skipped
    const oppCall = mockUseFindOneRecord.mock.calls.find(
      (call: { objectNameSingular: string }[]) =>
        call[0].objectNameSingular === CoreObjectNameSingular.Opportunity,
    );

    expect(oppCall?.[0].skip).toBe(true);

    // Company people query SHOULD be skipped
    expect(mockUseFindManyRecords.mock.calls[0][0].skip).toBe(true);
  });
});
