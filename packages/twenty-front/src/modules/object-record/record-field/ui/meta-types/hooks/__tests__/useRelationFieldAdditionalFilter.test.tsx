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
    it('should exclude PARENT company ids', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-1' }, { id: 'parent-2' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({
        not: { id: { in: ['parent-1', 'parent-2'] } },
      });
    });

    it('should return undefined when no PARENT companies exist', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toBeUndefined();
    });

    it('should return no-match while loading', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should fetch PARENT companies', () => {
      renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'clientAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(mockUseFindManyRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          objectNameSingular: 'company',
          skip: false,
        }),
      );
    });
  });

  describe('parentAccount field', () => {
    it('should return id-in filter with PARENT company ids', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-1' }, { id: 'parent-2' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { in: ['parent-1', 'parent-2'] } });
    });

    it('should return no-match when no PARENT companies exist', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match while loading', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match when current company is PARENT (hierarchy enforcement)', () => {
      mockUseFindOneRecord.mockImplementation(
        ({ objectNameSingular: name }: { objectNameSingular: string }) => {
          if (name === 'company') {
            return { ...noOpFindOneRecord, record: { id: 'company-1', accountType: 'PARENT' } };
          }
          return noOpFindOneRecord;
        },
      );
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-2' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match while current company record is loading', () => {
      mockUseFindOneRecord.mockImplementation(
        ({ objectNameSingular: name }: { objectNameSingular: string }) => {
          if (name === 'company') {
            return { ...noOpFindOneRecord, record: null, loading: true };
          }
          return noOpFindOneRecord;
        },
      );

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'parentAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
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

  describe('childAccount field on company', () => {
    it('should exclude PARENT company ids', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        records: [{ id: 'parent-1' }],
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({
        not: { id: { in: ['parent-1'] } },
      });
    });

    it('should return undefined when no PARENT companies exist', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toBeUndefined();
    });

    it('should return no-match while loading', () => {
      mockUseFindManyRecords.mockReturnValue({
        ...noOpFindManyRecords,
        loading: true,
      });

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should not apply childAccount filter for other objects', () => {
      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(result.current).toBeUndefined();
    });

    it('should return no-match when current company is LEGAL_ENTITY (hierarchy enforcement)', () => {
      mockUseFindOneRecord.mockImplementation(
        ({ objectNameSingular: name }: { objectNameSingular: string }) => {
          if (name === 'company') {
            return { ...noOpFindOneRecord, record: { id: 'company-1', accountType: 'LEGAL_ENTITY' } };
          }
          return noOpFindOneRecord;
        },
      );

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
    });

    it('should return no-match while current company record is loading', () => {
      mockUseFindOneRecord.mockImplementation(
        ({ objectNameSingular: name }: { objectNameSingular: string }) => {
          if (name === 'company') {
            return { ...noOpFindOneRecord, record: null, loading: true };
          }
          return noOpFindOneRecord;
        },
      );

      const { result } = renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'childAccount',
          recordId: 'company-1',
          objectNameSingular: 'company',
        }),
      );

      expect(result.current).toEqual({ id: { eq: 'no-match' } });
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

    it('should skip the PARENT company fetch for fields with no rule', () => {
      renderHook(() =>
        useRelationFieldAdditionalFilter({
          fieldName: 'assignee',
          recordId: 'opp-1',
          objectNameSingular: 'opportunity',
        }),
      );

      expect(mockUseFindManyRecords).toHaveBeenCalledWith(
        expect.objectContaining({ skip: true }),
      );
    });
  });
});
