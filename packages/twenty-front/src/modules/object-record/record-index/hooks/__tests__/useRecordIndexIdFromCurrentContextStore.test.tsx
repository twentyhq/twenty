import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { renderHook } from '@testing-library/react';
import { TestObjectMetadataItemSetter } from '~/testing/test-helpers/TestObjectMetadataItemSetter';
import { getTestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksAndActionMenuWrapper';

const testComponentInstanceId = 'test';
const testCurrentViewId = 'view-id';
const testObjectMetadataItemNameSingular = 'person';
const testObjectMetadataItemNamePlural = 'people';

const Wrapper = getTestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: testComponentInstanceId,
  contextStoreCurrentObjectMetadataNameSingular:
    testObjectMetadataItemNameSingular,
  contextStoreCurrentViewId: testCurrentViewId,
});

describe('useRecordIndexIdFromCurrentContextStore', () => {
  it('works as expected with context', async () => {
    const { result } = renderHook(
      () => {
        const { objectMetadataItem, recordIndexId } =
          useRecordIndexIdFromCurrentContextStore();

        return {
          objectMetadataItem,
          recordIndexId,
        };
      },
      {
        wrapper: ({ children }) => {
          return (
            <Wrapper>
              <TestObjectMetadataItemSetter>
                {children}
              </TestObjectMetadataItemSetter>
            </Wrapper>
          );
        },
      },
    );

    expect(result.current.recordIndexId).toBe(
      `${testObjectMetadataItemNamePlural}-${testCurrentViewId}`,
    );
  });
});
