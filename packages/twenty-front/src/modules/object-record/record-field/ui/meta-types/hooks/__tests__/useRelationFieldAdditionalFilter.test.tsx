import { renderHook } from '@testing-library/react';

import { useRelationFieldAdditionalFilter } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFieldAdditionalFilter';

const mockUseFindOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (...args: unknown[]) => mockUseFindOneRecord(...args),
}));

const noOpFindOneRecord = {
  record: null,
  loading: false,
  error: undefined,
  objectMetadataItem: {} as any,
  query: {} as any,
  queryStateIdentifier: '',
};

describe('useRelationFieldAdditionalFilter', () => {
  beforeEach(() => {
    mockUseFindOneRecord.mockReturnValue(noOpFindOneRecord);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('associatedDesk field on opportunity', () => {
    it('should return id-in filter with desk ids for the company', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: {
          id: 'opp-1',
          company: {
            id: 'company-abc',
            desks: [{ id: 'desk-1' }, { id: 'desk-2' }],
          },
        } as any,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'associatedDesk',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { in: ['desk-1', 'desk-2'] } });
    });

    it('should return no-match when company has no desks', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: { id: 'opp-1', company: { id: 'company-abc', desks: [] } } as any,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'associatedDesk',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match when company is not yet set', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: { id: 'opp-1', company: null } as any,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'associatedDesk',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match when record has not loaded yet', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: null,
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'associatedDesk',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should not apply desk filter when object is not opportunity', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'associatedDesk',
          recordId: 'some-id',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toBeUndefined();
    });
  });

  describe('unrelated fields', () => {
    it('should return undefined for fields with no filter rule', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'assignee',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toBeUndefined();
    });
  });
});
