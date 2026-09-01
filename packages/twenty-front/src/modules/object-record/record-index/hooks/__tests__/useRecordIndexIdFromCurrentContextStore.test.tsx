import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
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

  it('isolates the record index ID on a secondary surface', () => {
    const { result } = renderHook(
      () => useRecordIndexIdFromCurrentContextStore(),
      {
        wrapper: ({ children }) => (
          <WorkspaceSurfaceContext.Provider
            value={{
              type: 'side-panel',
              instanceId: 'side-panel-page-1',
              ownsRouteLocation: true,
            }}
          >
            <Wrapper>
              <JestObjectMetadataItemSetter>
                {children}
              </JestObjectMetadataItemSetter>
            </Wrapper>
          </WorkspaceSurfaceContext.Provider>
        ),
      },
    );

    expect(result.current.recordIndexId).toBe(
      `${testObjectMetadataItemNamePlural}-${testCurrentViewId}-side-panel-page-1`,
    );
  });
});
