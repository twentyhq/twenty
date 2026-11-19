import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'main' }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

const RECORD_ID = 'opportunity-id';

const STORED_RECORD = {
  id: RECORD_ID,
  __typename: 'Opportunity',
  stage: 'NEW',
};

const renderWidgetVisibilityContext = ({
  isTargetRecordLoading,
}: {
  isTargetRecordLoading: boolean;
}) => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(RECORD_ID), STORED_RECORD);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: RECORD_ID,
            targetObjectNameSingular: 'opportunity',
          },
          isTargetRecordLoading,
          layoutType: PageLayoutType.RECORD_PAGE,
        }}
      >
        {children}
      </LayoutRenderingProvider>
    </JotaiProvider>
  );

  return renderHook(() => useWidgetVisibilityContext(), { wrapper });
};

describe('useWidgetVisibilityContext', () => {
  it('should expose no selected record while the target record is loading', () => {
    const { result } = renderWidgetVisibilityContext({
      isTargetRecordLoading: true,
    });

    expect(result.current.selectedRecords).toEqual([]);
  });

  it('should expose the stored record once the target record is loaded', () => {
    const { result } = renderWidgetVisibilityContext({
      isTargetRecordLoading: false,
    });

    expect(result.current.selectedRecords).toEqual([STORED_RECORD]);
  });
});
