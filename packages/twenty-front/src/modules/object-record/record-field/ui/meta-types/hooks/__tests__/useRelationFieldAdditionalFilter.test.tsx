import { renderHook } from '@testing-library/react';

import { useRelationFieldAdditionalFilter } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFieldAdditionalFilter';

const mockUseFindOneRecord = jest.fn();
const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (...args: unknown[]) => mockUseFindOneRecord(...args),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (...args: unknown[]) => mockUseFindManyRecords(...args),
}));

const noOpFindOneRecord = {
  record: null,
  loading: false,
  error: undefined,
  objectMetadataItem: {} as any,
  query: {} as any,
  queryStateIdentifier: '',
};

const noOpFindManyRecords = {
  records: [],
  loading: false,
  error: undefined,
};

describe('useRelationFieldAdditionalFilter', () => {
  beforeEach(() => {
    mockUseFindOneRecord.mockReturnValue(noOpFindOneRecord);
    mockUseFindManyRecords.mockReturnValue(noOpFindManyRecords);
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

    it('should skip the opportunity fetch', () => {
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

  describe('company field on person or opportunity', () => {
    it('should exclude parent company ids on person', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-1' }, { id: 'parent-2' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'person-1',
          objectNameSingular: 'person',
        }),
      );

      expect(result.current).toEqual({
        not: { id: { in: ['parent-1', 'parent-2'] } },
      });
    });

    it('should exclude parent company ids on opportunity', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-1' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({
        not: { id: { in: ['parent-1'] } },
      });
    });

    it('should return undefined when no parent companies exist', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'person-1',
          objectNameSingular: 'person',
        }),
      );

      expect(result.current).toBeUndefined();
    });

    it('should return no-match while parent companies are loading', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [],
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'person-1',
          objectNameSingular: 'person',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should fetch PARENT companies when field is company on person', () => {
      renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'person-1',
          objectNameSingular: 'person',
        }),
      );

      expect(mockUseFindManyRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          objectNameSingular: 'company',
          skip: false,
        }),
      );
    });

    it('should not apply company filter for other objects', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'company',
          recordId: 'task-1',
          objectNameSingular: 'task',
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

    it('should return LEGAL_ENTITY filter for clientAccount regardless of parent object', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'task-1',
          objectNameSingular: 'task',
        }),
      );

      expect(result.current).toEqual({ accountType: { eq: 'LEGAL_ENTITY' } });
    });
  });
});
