import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const mockRecordOneToManyFieldAttachTargetRecord = jest.fn();
const mockRecordOneToManyFieldDetachTargetRecord = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useRecordOneToManyFieldAttachTargetRecord', () => ({
  useRecordOneToManyFieldAttachTargetRecord: () => ({
    recordOneToManyFieldAttachTargetRecord:
      mockRecordOneToManyFieldAttachTargetRecord,
  }),
}));
jest.mock('@/object-record/hooks/useRecordOneToManyFieldDetachTargetRecord', () => ({
  useRecordOneToManyFieldDetachTargetRecord: () => ({
    recordOneToManyFieldDetachTargetRecord:
      mockRecordOneToManyFieldDetachTargetRecord,
  }),
}));

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);

const relationFieldDefinition = {
  fieldMetadataId: 'field-metadata-id',
  type: FieldMetadataType.RELATION,
  metadata: {
    fieldName: 'people',
    relationObjectMetadataNameSingular: 'person',
    objectMetadataNameSingular: 'company',
    targetFieldMetadataName: 'company',
  },
};

const fieldContextValue = {
  recordId: 'company-record-id',
  fieldDefinition: relationFieldDefinition,
  isLabelIdentifier: false,
  isRecordFieldReadOnly: false,
};

const wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <FieldContext.Provider value={fieldContextValue as never}>
      {children}
    </FieldContext.Provider>
  );
};

describe('useUpdateRelationOneToManyFieldInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItem.mockImplementation(({ objectNameSingular }) => {
      if (objectNameSingular === 'company') {
        return {
          objectMetadataItem: {
            nameSingular: 'company',
            namePlural: 'companies',
            fields: [],
          },
        } as never;
      }

      return {
        objectMetadataItem: {
          nameSingular: 'person',
          namePlural: 'people',
          fields: [],
        },
      } as never;
    });
  });

  it('should fallback to target field metadata name when target field metadata is missing', async () => {
    const { result } = renderHook(() => useUpdateRelationOneToManyFieldInput(), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateRelation({
        recordId: 'person-record-id',
        objectMetadataId: 'person-object-metadata-id',
        isSelected: true,
        isMatchingSearchFilter: true,
      });
    });

    expect(mockRecordOneToManyFieldAttachTargetRecord).toHaveBeenCalledWith({
      sourceObjectNameSingular: 'company',
      targetObjectNameSingular: 'person',
      targetGQLFieldName: 'company',
      sourceRecordId: 'company-record-id',
      targetRecordId: 'person-record-id',
    });
  });

  it('should compute morph target gql field name when target field metadata is a morph relation', async () => {
    mockUseObjectMetadataItem.mockImplementation(({ objectNameSingular }) => {
      if (objectNameSingular === 'company') {
        return {
          objectMetadataItem: {
            nameSingular: 'company',
            namePlural: 'companies',
            fields: [],
          },
        } as never;
      }

      return {
        objectMetadataItem: {
          nameSingular: 'person',
          namePlural: 'people',
          fields: [
            {
              name: 'company',
              type: FieldMetadataType.MORPH_RELATION,
              settings: {
                relationType: RelationType.MANY_TO_ONE,
              },
            },
          ],
        },
      } as never;
    });

    const { result } = renderHook(() => useUpdateRelationOneToManyFieldInput(), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateRelation({
        recordId: 'person-record-id',
        objectMetadataId: 'person-object-metadata-id',
        isSelected: true,
        isMatchingSearchFilter: true,
      });
    });

    expect(mockRecordOneToManyFieldAttachTargetRecord).toHaveBeenCalledWith({
      sourceObjectNameSingular: 'company',
      targetObjectNameSingular: 'person',
      targetGQLFieldName: 'companyCompany',
      sourceRecordId: 'company-record-id',
      targetRecordId: 'person-record-id',
    });
  });
});
