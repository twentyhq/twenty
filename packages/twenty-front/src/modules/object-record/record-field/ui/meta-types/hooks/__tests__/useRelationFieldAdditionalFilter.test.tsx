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

  describe('clientAccount field', () => {
    it('should return LEGAL_ENTITY filter', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ accountType: { eq: 'LEGAL_ENTITY' } });
    });

    it('should not call useFindOneRecord', () => {
      renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(mockUseFindOneRecord).toHaveBeenCalledWith(
        expect.objectContaining({ skip: true }),
      );
    });
  });

  describe('parentAccount field', () => {
    it('should return PARENT filter', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ accountType: { eq: 'PARENT' } });
    });
  });

  describe('clientAccountTeam field on opportunity', () => {
    it('should filter teams by the selected clientAccount id', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: { id: 'opp-1', clientAccount: { id: 'account-abc' } } as any,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccountTeam',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({
        withinCompany: { id: { eq: 'account-abc' } },
      });
    });

    it('should return no-match filter when clientAccount is not yet set', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: { id: 'opp-1', clientAccount: null } as any,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccountTeam',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match filter when record has not loaded yet', () => {
      mockUseFindOneRecord.mockReturnValue({
        ...noOpFindOneRecord,
        record: null,
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccountTeam',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should fetch the opportunity record to get clientAccount id', () => {
      renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccountTeam',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(mockUseFindOneRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          objectNameSingular: 'opportunity',
          objectRecordId: 'opp-1',
          skip: false,
        }),
      );
    });

    it('should not apply team filter when object is not opportunity', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccountTeam',
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

    it('should return undefined when object is not recognised', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'task-1',
          objectNameSingular: 'task',
        }),
      );

      // clientAccount filter applies regardless of parent object
      expect(result.current).toEqual({ accountType: { eq: 'LEGAL_ENTITY' } });
    });
  });
});
