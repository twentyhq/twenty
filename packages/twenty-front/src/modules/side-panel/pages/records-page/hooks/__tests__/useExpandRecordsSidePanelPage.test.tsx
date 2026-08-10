import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';

import { useExpandRecordsSidePanelPage } from '@/side-panel/pages/records-page/hooks/useExpandRecordsSidePanelPage';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { viewableRecordsViewIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsViewIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const navigateAppMock = jest.fn();
const closeSidePanelMenuMock = jest.fn();

let mockIsMobile = false;

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: closeSidePanelMenuMock,
  }),
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';
const VIEW_ID = '11111111-1111-4111-8111-111111111111';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const renderExpandRecordsSidePanelPage = ({
  objectMetadataId,
  viewId,
}: {
  objectMetadataId: string | null;
  viewId: string | null;
}) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(
        viewableRecordsObjectMetadataIdComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        objectMetadataId,
      );
      store.set(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        viewId,
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: PAGE_INSTANCE_ID }}
        >
          {children}
        </SidePanelPageComponentInstanceContext.Provider>
      </I18nProvider>
    </BaseWrapper>
  );

  return renderHook(() => useExpandRecordsSidePanelPage(), { wrapper });
};

describe('useExpandRecordsSidePanelPage', () => {
  beforeEach(() => {
    mockIsMobile = false;
    jest.clearAllMocks();
  });

  it('should expand to the record index page of the displayed view', () => {
    const { result } = renderExpandRecordsSidePanelPage({
      objectMetadataId: companyObjectMetadataItem.id,
      viewId: VIEW_ID,
    });

    act(() => {
      result.current?.expand();
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.RecordIndexPage,
      { objectNamePlural: companyObjectMetadataItem.namePlural },
      { viewId: VIEW_ID },
    );
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should not expand when the object metadata is unknown', () => {
    const { result } = renderExpandRecordsSidePanelPage({
      objectMetadataId: 'a2b3c4d5-0000-4000-8000-000000000000',
      viewId: VIEW_ID,
    });

    expect(result.current).toBeNull();
  });

  it('should not expand when no view is displayed', () => {
    const { result } = renderExpandRecordsSidePanelPage({
      objectMetadataId: companyObjectMetadataItem.id,
      viewId: null,
    });

    expect(result.current).toBeNull();
  });

  it('should not expand when the view id is empty', () => {
    const { result } = renderExpandRecordsSidePanelPage({
      objectMetadataId: companyObjectMetadataItem.id,
      viewId: '',
    });

    expect(result.current).toBeNull();
  });

  it('should not expand on mobile where the panel already fills the viewport', () => {
    mockIsMobile = true;

    const { result } = renderExpandRecordsSidePanelPage({
      objectMetadataId: companyObjectMetadataItem.id,
      viewId: VIEW_ID,
    });

    expect(result.current).toBeNull();
  });
});
