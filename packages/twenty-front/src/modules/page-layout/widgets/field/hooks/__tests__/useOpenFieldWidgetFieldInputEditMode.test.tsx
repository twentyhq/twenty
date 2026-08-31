import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { act, renderHook } from '@testing-library/react';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockOpenJunctionRelationFieldInput = jest.fn();
const mockOpenRelationFromManyFieldInput = jest.fn();
const mockOpenRelationToOneFieldInput = jest.fn();
const mockOpenMorphRelationOneToManyFieldInput = jest.fn();
const mockOpenMorphRelationManyToOneFieldInput = jest.fn();
const mockPushFocusItemToFocusStack = jest.fn();
const mockRemoveFocusItemFromFocusStackById = jest.fn();

const mockObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const mockTaskMetadata = getMockObjectMetadataItemOrThrow('task');
const mockRocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
const mockOwningTaskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockTaskMetadata,
  fieldName: 'taskTargets',
});
const mockRocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockRocketMetadata,
  fieldName: 'taskTargets',
});
const mockAmbiguousObjectMetadataItems = mockObjectMetadataItems.map((item) =>
  item.id === mockTaskMetadata.id
    ? {
        ...item,
        fields: [
          ...item.fields,
          {
            ...mockOwningTaskTargetsField,
            id: 'duplicate-task-targets-field-id',
            name: 'duplicateTaskTargets',
          },
        ],
      }
    : item,
);
const mockFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: mockRocketTaskTargetsField,
  objectMetadataItem: mockRocketMetadata,
}) as FieldDefinition<FieldRelationMetadata>;

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: mockAmbiguousObjectMetadataItems,
  }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useOpenJunctionRelationFieldInput',
  () => ({
    useOpenJunctionRelationFieldInput: () => ({
      openJunctionRelationFieldInput: mockOpenJunctionRelationFieldInput,
    }),
  }),
);

jest.mock(
  '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput',
  () => ({
    useOpenRelationFromManyFieldInput: () => ({
      openRelationFromManyFieldInput: mockOpenRelationFromManyFieldInput,
    }),
  }),
);

jest.mock(
  '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput',
  () => ({
    useOpenRelationToOneFieldInput: () => ({
      openRelationToOneFieldInput: mockOpenRelationToOneFieldInput,
    }),
  }),
);

jest.mock(
  '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput',
  () => ({
    useOpenMorphRelationOneToManyFieldInput: () => ({
      openMorphRelationOneToManyFieldInput:
        mockOpenMorphRelationOneToManyFieldInput,
    }),
  }),
);

jest.mock(
  '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationManyToOneFieldInput',
  () => ({
    useOpenMorphRelationManyToOneFieldInput: () => ({
      openMorphRelationManyToOneFieldInput:
        mockOpenMorphRelationManyToOneFieldInput,
    }),
  }),
);

jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: mockPushFocusItemToFocusStack,
  }),
}));

jest.mock(
  '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById',
  () => ({
    useRemoveFocusItemFromFocusStackById: () => ({
      removeFocusItemFromFocusStackById: mockRemoveFocusItemFromFocusStackById,
    }),
  }),
);

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'field-widget-instance-id',
  }),
);

describe('useOpenFieldWidgetFieldInputEditMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fall back to raw pivot editing for an ambiguous reverse junction', () => {
    const { result } = renderHook(() => useOpenFieldWidgetFieldInputEditMode());

    act(() => {
      result.current.openFieldInput({
        fieldDefinition: mockFieldDefinition,
        recordId: 'rocket-record-id',
      });
    });

    expect(mockOpenJunctionRelationFieldInput).toHaveBeenCalledTimes(1);
    expect(mockOpenRelationFromManyFieldInput).not.toHaveBeenCalled();
    expect(mockPushFocusItemToFocusStack).not.toHaveBeenCalled();
  });
});
