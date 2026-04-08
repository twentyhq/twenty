import { renderHook } from '@testing-library/react';

import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useGetShouldInitializeRecordBoardForUpdateInputs } from '@/object-record/record-board/hooks/useGetShouldInitializeRecordBoardForUpdateInputs';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FieldMetadataType } from 'twenty-shared/types';

jest.mock('@/object-metadata/hooks/useActiveFieldMetadataItems');
jest.mock('@/object-record/record-index/contexts/RecordIndexContext');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');

const mockUseActiveFieldMetadataItems = jest.mocked(
  useActiveFieldMetadataItems,
);
const mockUseRecordIndexContextOrThrow = jest.mocked(
  useRecordIndexContextOrThrow,
);
const mockUseAtomComponentStateValue = jest.mocked(useAtomComponentStateValue);

describe('useGetShouldInitializeRecordBoardForUpdateInputs', () => {
  beforeEach(() => {
    mockUseRecordIndexContextOrThrow.mockReturnValue({
      objectMetadataItem: {
        id: 'opportunity-object-id',
      },
    } as never);

    mockUseActiveFieldMetadataItems.mockReturnValue({
      activeFieldMetadataItems: [
        {
          id: 'stage-field-id',
          name: 'stage',
          type: FieldMetadataType.SELECT,
        },
      ] as FieldMetadataItem[],
    });

    mockUseAtomComponentStateValue.mockImplementation((state) => {
      if (state === currentRecordSortsComponentState) {
        return [];
      }

      if (state === currentRecordFiltersComponentState) {
        return [];
      }

      if (state === recordIndexGroupFieldMetadataItemComponentState) {
        return {
          id: 'stage-field-id',
        };
      }

      return undefined;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reinitialize the board for a kanban drop style stage and position update', () => {
    const { result } = renderHook(() =>
      useGetShouldInitializeRecordBoardForUpdateInputs(),
    );

    expect(
      result.current.getShouldInitializeRecordBoardForUpdateInputs([
        {
          recordId: 'opportunity-id',
          updatedFields: [{ stage: 'SCREENING' }, { position: 1 }],
        },
      ]),
    ).toBe(true);
  });
});
