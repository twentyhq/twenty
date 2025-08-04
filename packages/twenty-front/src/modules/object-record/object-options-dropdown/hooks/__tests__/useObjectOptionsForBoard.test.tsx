import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('@/views/hooks/useSaveCurrentViewFields', () => ({
  useSaveCurrentViewFields: jest.fn(() => ({
    saveViewFields: jest.fn(),
  })),
}));

jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: jest.fn(() => ({
    updateCurrentView: jest.fn(),
  })),
}));

const objectNameSingular = 'company';

describe('useObjectOptionsForBoard', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!mockObjectMetadataItem) {
    throw new Error('Mock object metadata item not found');
  }

  const mockFieldMetadataItem1 = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  if (!mockFieldMetadataItem1) {
    throw new Error('Mock field metadata item not found for "name"');
  }

  const mockFieldMetadataItem2 = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'createdAt',
  );

  if (!mockFieldMetadataItem2) {
    throw new Error('Mock field metadata item not found for "createdAt"');
  }

  const initialRecoilState = [
    {
      fieldMetadataId: mockFieldMetadataItem1.id,
      isVisible: true,
      position: 0,
    },
    {
      fieldMetadataId: mockFieldMetadataItem2.id,
      isVisible: true,
      position: 1,
    },
  ];

  const renderWithRecoil = () =>
    renderHook(
      () =>
        useObjectOptionsForBoard({
          objectNameSingular,
          recordBoardId: 'boardId',
          viewBarId: 'viewBarId',
        }),
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              recordIndexFieldDefinitionsState,
              initialRecoilState as any,
            );
          },
          componentInstanceId: 'test',
          contextStoreCurrentObjectMetadataNameSingular: objectNameSingular,
        }),
      },
    );

  it('reorders fields correctly', () => {
    const { result } = renderWithRecoil();

    const dropResult: DropResult = {
      source: { droppableId: 'droppable', index: 1 },
      destination: { droppableId: 'droppable', index: 2 },
      draggableId: mockFieldMetadataItem1.id,
      type: 'TYPE',
      mode: 'FLUID',
      reason: 'DROP',
      combine: null,
    };

    const responderProvided: ResponderProvided = {
      announce: jest.fn(),
    };

    act(() => {
      result.current.handleReorderBoardFields(dropResult, responderProvided);
    });

    expect(result.current.visibleBoardFields).toEqual([
      {
        fieldMetadataId: mockFieldMetadataItem2.id,
        isVisible: true,
        position: 0,
      },
      {
        fieldMetadataId: mockFieldMetadataItem1.id,
        isVisible: true,
        position: 1,
      },
    ]);
  });
});
