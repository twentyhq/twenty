import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useObjectMetadataItem', () => {
  it('should return correct properties', async () => {
    const { result } = renderHook(
      () => useObjectMetadataItem({ objectNameSingular: 'opportunity' }),
      {
        wrapper: Wrapper,
      },
    );

    const {
      basePathToShowPage,
      objectMetadataItem,
      labelIdentifierFieldMetadata,
      getRecordFromCache,
      findManyRecordsQuery,
      findOneRecordQuery,
      createOneRecordMutation,
      updateOneRecordMutation,
      deleteOneRecordMutation,
      executeQuickActionOnOneRecordMutation,
      createManyRecordsMutation,
      deleteManyRecordsMutation,
      mapToObjectRecordIdentifier,
      getObjectOrderByField,
    } = result.current;

    expect(labelIdentifierFieldMetadata).toBeUndefined();
    expect(basePathToShowPage).toBe('/object/opportunity/');
    expect(objectMetadataItem.id).toBe('20202020-cae9-4ff4-9579-f7d9fe44c937');
    expect(typeof getRecordFromCache).toBe('function');
    expect(typeof mapToObjectRecordIdentifier).toBe('function');
    expect(typeof getObjectOrderByField).toBe('function');
    expect(findManyRecordsQuery).toHaveProperty('kind', 'Document');
    expect(findOneRecordQuery).toHaveProperty('kind', 'Document');
    expect(createOneRecordMutation).toHaveProperty('kind', 'Document');
    expect(updateOneRecordMutation).toHaveProperty('kind', 'Document');
    expect(deleteOneRecordMutation).toHaveProperty('kind', 'Document');
    expect(executeQuickActionOnOneRecordMutation).toHaveProperty(
      'kind',
      'Document',
    );
    expect(createManyRecordsMutation).toHaveProperty('kind', 'Document');
    expect(deleteManyRecordsMutation).toHaveProperty('kind', 'Document');
  });
});
