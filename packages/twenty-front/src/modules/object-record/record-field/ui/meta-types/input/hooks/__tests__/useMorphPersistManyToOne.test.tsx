import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useMorphPersistManyToOne } from '@/object-record/record-field/ui/meta-types/input/hooks/useMorphPersistManyToOne';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const mockUpdateOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        id: 'company-metadata-id',
        nameSingular: 'company',
        namePlural: 'companies',
      },
      {
        id: 'person-metadata-id',
        nameSingular: 'person',
        namePlural: 'people',
      },
    ],
  }),
}));

const mockMorphFieldDefinition = {
  fieldMetadataId: 'morph-field-id',
  label: 'Polymorphic Owner',
  iconName: 'IconUser',
  type: FieldMetadataType.MORPH_RELATION,
  metadata: {
    fieldName: 'polymorphicOwner',
    relationType: RelationType.MANY_TO_ONE,
    objectMetadataNameSingular: 'task',
    morphRelations: [
      {
        type: RelationType.MANY_TO_ONE,
        sourceFieldMetadata: {
          id: 'source-field-1',
          name: 'polymorphicOwner',
        },
        targetFieldMetadata: {
          id: 'target-field-1',
          name: 'tasks',
          isCustom: false,
        },
        sourceObjectMetadata: {
          id: 'task-metadata-id',
          nameSingular: 'task',
          namePlural: 'tasks',
        },
        targetObjectMetadata: {
          id: 'company-metadata-id',
          nameSingular: 'company',
          namePlural: 'companies',
        },
      },
      {
        type: RelationType.MANY_TO_ONE,
        sourceFieldMetadata: {
          id: 'source-field-2',
          name: 'polymorphicOwner',
        },
        targetFieldMetadata: {
          id: 'target-field-2',
          name: 'tasks',
          isCustom: false,
        },
        sourceObjectMetadata: {
          id: 'task-metadata-id',
          nameSingular: 'task',
          namePlural: 'tasks',
        },
        targetObjectMetadata: {
          id: 'person-metadata-id',
          nameSingular: 'person',
          namePlural: 'people',
        },
      },
    ],
  },
} as FieldDefinition<FieldMorphRelationMetadata>;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useMorphPersistManyToOne', () => {
  beforeEach(() => {
    mockUpdateOneRecord.mockClear();
  });

  it('should set all morph relation fields to null when detaching (valueToPersist is null)', async () => {
    const { result } = renderHook(
      () =>
        useMorphPersistManyToOne({
          objectMetadataNameSingular: 'task',
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      await result.current.persistMorphManyToOne({
        recordId: 'test-record-id',
        fieldDefinition: mockMorphFieldDefinition,
        valueToPersist: null,
      });
    });

    await waitFor(() => {
      expect(mockUpdateOneRecord).toHaveBeenCalledTimes(1);
      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: 'task',
        idToUpdate: 'test-record-id',
        updateOneRecordInput: {
          polymorphicOwnerCompanyId: null,
          polymorphicOwnerPersonId: null,
        },
      });
    });
  });

  it('should set all morph relation fields to null when detaching (valueToPersist is undefined)', async () => {
    const { result } = renderHook(
      () =>
        useMorphPersistManyToOne({
          objectMetadataNameSingular: 'task',
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      await result.current.persistMorphManyToOne({
        recordId: 'test-record-id',
        fieldDefinition: mockMorphFieldDefinition,
        valueToPersist: undefined,
      });
    });

    await waitFor(() => {
      expect(mockUpdateOneRecord).toHaveBeenCalledTimes(1);
      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: 'task',
        idToUpdate: 'test-record-id',
        updateOneRecordInput: {
          polymorphicOwnerCompanyId: null,
          polymorphicOwnerPersonId: null,
        },
      });
    });
  });

  it('should update the specific relation field when selecting a record', async () => {
    const { result } = renderHook(
      () =>
        useMorphPersistManyToOne({
          objectMetadataNameSingular: 'task',
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      await result.current.persistMorphManyToOne({
        recordId: 'test-record-id',
        fieldDefinition: mockMorphFieldDefinition,
        valueToPersist: 'selected-company-id',
        targetObjectMetadataNameSingular: 'company',
      });
    });

    await waitFor(() => {
      expect(mockUpdateOneRecord).toHaveBeenCalledTimes(1);
      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: 'task',
        idToUpdate: 'test-record-id',
        updateOneRecordInput: {
          polymorphicOwnerCompanyId: 'selected-company-id',
          polymorphicOwnerPersonId: null,
        },
      });
    });
  });
});
