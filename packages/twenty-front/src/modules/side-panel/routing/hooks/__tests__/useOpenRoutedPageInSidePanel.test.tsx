import { act, renderHook } from '@testing-library/react';
import { SidePanelPages } from 'twenty-shared/types';

import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const navigateSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const renderOpenRoutedPageInSidePanel = () =>
  renderHook(() => useOpenRoutedPageInSidePanel(), {
    wrapper: getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] }),
  });

describe('useOpenRoutedPageInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open an object settings path titled after the object', () => {
    const { result } = renderOpenRoutedPageInSidePanel();

    act(() =>
      result.current.openRoutedPageInSidePanel({
        path: `/settings/objects/${companyObjectMetadataItem.namePlural}`,
      }),
    );

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.RoutedPage,
        pageTitle: companyObjectMetadataItem.labelPlural,
      }),
    );
  });

  it('should open a field settings path titled after the field', () => {
    const { result } = renderOpenRoutedPageInSidePanel();

    act(() =>
      result.current.openRoutedPageInSidePanel({
        path: `/settings/objects/${companyObjectMetadataItem.namePlural}/${nameFieldMetadataItem.name}`,
      }),
    );

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.RoutedPage,
        pageTitle: nameFieldMetadataItem.label,
      }),
    );
  });

  it('should do nothing for a path outside the hostable set', () => {
    const { result } = renderOpenRoutedPageInSidePanel();

    act(() =>
      result.current.openRoutedPageInSidePanel({ path: '/settings/billing' }),
    );

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
