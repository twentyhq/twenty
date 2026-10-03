import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useComputeRecordRelationFilterDisplayValue } from '@/views/hooks/useComputeRecordRelationFilterDisplayValue';
import { renderHook } from '@testing-library/react';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const OTHER_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

const objectMetadataItems = [
  {
    nameSingular: 'company',
    fields: [
      {
        id: 'created-by-field-id',
        name: 'createdBy',
        label: 'Created by',
        type: FieldMetadataType.ACTOR,
      },
    ],
  },
  {
    nameSingular: 'workspaceMember',
    labelPlural: 'Workspace Members',
    fields: [],
  },
];

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems }),
}));

const mockUseRecordsForSelect = jest.fn();

jest.mock('@/object-record/select/hooks/useRecordsForSelect', () => ({
  useRecordsForSelect: (params: unknown) => mockUseRecordsForSelect(params),
}));

describe('useComputeRecordRelationFilterDisplayValue', () => {
  it('resolves an actor filter on workspaceMemberId against workspace members', () => {
    mockUseRecordsForSelect.mockReturnValue({
      selectedRecords: [{ id: OTHER_MEMBER_ID, name: 'Aaron Munoz' }],
      loading: false,
    });

    const value = JSON.stringify({
      isCurrentWorkspaceMemberSelected: true,
      selectedRecordIds: [OTHER_MEMBER_ID],
    });

    const recordFilter: RecordFilter = {
      id: 'filter-id',
      fieldMetadataId: 'created-by-field-id',
      value,
      displayValue: value,
      type: 'ACTOR',
      operand: ViewFilterOperand.IS,
      label: 'Created by',
      subFieldName: 'workspaceMemberId',
    };

    const { result } = renderHook(() =>
      useComputeRecordRelationFilterDisplayValue({ recordFilter }),
    );

    expect(mockUseRecordsForSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'workspaceMember',
        selectedIds: [OTHER_MEMBER_ID],
      }),
    );
    expect(result.current).toEqual({
      displayValue: 'Me, Aaron Munoz',
      loading: false,
    });
  });
});
