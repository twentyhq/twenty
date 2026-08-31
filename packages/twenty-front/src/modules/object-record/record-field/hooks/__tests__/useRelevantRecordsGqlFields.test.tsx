import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPONENT_INSTANCE_ID = 'instanceId';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const noteTargetsFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'noteTargets',
});

const getWrapper = (visibleFieldMetadataItemIds: string[]) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(
        currentRecordFieldsComponentState.atomFamily({
          instanceId: COMPONENT_INSTANCE_ID,
        }),
        visibleFieldMetadataItemIds.map((fieldMetadataItemId, index) => ({
          id: `record-field-${fieldMetadataItemId}`,
          fieldMetadataItemId,
          position: index,
          isVisible: true,
          size: 100,
        })),
      );
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <MetadataAndApolloMocksWrapper>
      <JestRecordIndexContextProviderWrapper
        objectMetadataItem={companyObjectMetadataItem}
      >
        {children}
      </JestRecordIndexContextProviderWrapper>
    </MetadataAndApolloMocksWrapper>
  );
};

describe('useRelevantRecordsGqlFields', () => {
  it('resolves the related record of a junction relation that is not visible', async () => {
    const { result } = renderHook(
      () =>
        useRelevantRecordsGqlFields({
          objectMetadataItem: companyObjectMetadataItem,
        }),
      { wrapper: getWrapper([]) },
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        noteTargets: {
          id: true,
          note: {
            id: true,
            title: true,
          },
        },
      }),
    );
  });

  it('resolves the related record of a junction relation that is visible', async () => {
    const { result } = renderHook(
      () =>
        useRelevantRecordsGqlFields({
          objectMetadataItem: companyObjectMetadataItem,
        }),
      { wrapper: getWrapper([noteTargetsFieldMetadataItem.id]) },
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        noteTargets: {
          id: true,
          note: {
            id: true,
            title: true,
          },
        },
      }),
    );
  });
});
