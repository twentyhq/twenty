import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useGetLookupRelationRecordKeys } from '@/object-record/record-column-scope/hooks/useGetLookupRelationRecordKeys';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});

const buildPeopleAlias = (
  scopedRelationAlias: Pick<ScopedRelationAlias, 'responseKey'> &
    Partial<Pick<ScopedRelationAlias, 'lookupTarget'>>,
): ScopedRelationAlias => ({
  recordFieldId: scopedRelationAlias.responseKey,
  relationObjectMetadataItem: personObjectMetadataItem,
  relationWithArguments: {
    relationFieldName: 'people',
    recordGqlFields: { id: true },
  },
  reachedObjectMetadataItemIds: [personObjectMetadataItem.id],
  isRestricted: false,
  ...scopedRelationAlias,
});

describe('useGetLookupRelationRecordKeys', () => {
  it('includes the response key of each scoped column showing a field of its related records', () => {
    const scopedRelationAliases = [
      buildPeopleAlias({ responseKey: 'people_records' }),
      buildPeopleAlias({
        responseKey: 'people_emails',
        lookupTarget: {
          relationFieldName: 'people',
          relationObjectMetadataItem: personObjectMetadataItem,
          lookupTargetFieldMetadataItem: emailsField,
          lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition(
            {
              field: emailsField,
              objectMetadataItem: personObjectMetadataItem,
            },
          ),
        },
      }),
    ];

    const { result } = renderHook(
      () => useGetLookupRelationRecordKeys('record-table-id'),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <JotaiProvider store={createStore()}>
            <ScopedRelationAliasesContext.Provider
              value={scopedRelationAliases}
            >
              {children}
            </ScopedRelationAliasesContext.Provider>
          </JotaiProvider>
        ),
      },
    );

    expect(result.current()).toEqual(['people_emails']);
  });
});
