import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { renderHook } from '@testing-library/react';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';

const testComponentInstanceId = 'test';
const testCurrentViewId = 'view-id';
const testObjectMetadataItemNameSingular = 'person';
const testObjectMetadataItemNamePlural = 'people';

const Wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
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
              <JestObjectMetadataItemSetter>
                {children}
              </JestObjectMetadataItemSetter>
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
