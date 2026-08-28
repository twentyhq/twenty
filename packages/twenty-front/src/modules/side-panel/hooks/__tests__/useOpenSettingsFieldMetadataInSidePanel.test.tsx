import { act, renderHook } from '@testing-library/react';
import { SidePanelPages } from 'twenty-shared/types';

import { useOpenSettingsFieldMetadataInSidePanel } from '@/side-panel/hooks/useOpenSettingsFieldMetadataInSidePanel';
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

const renderOpenSettingsFieldMetadataInSidePanel = () =>
  renderHook(() => useOpenSettingsFieldMetadataInSidePanel(), {
    wrapper: getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] }),
  });

describe('useOpenSettingsFieldMetadataInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the field in the side panel', () => {
    const { result } = renderOpenSettingsFieldMetadataInSidePanel();

    act(() =>
      result.current.openSettingsFieldMetadataInSidePanel({
        fieldMetadataId: nameFieldMetadataItem.id,
      }),
    );

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.SettingsFieldMetadata,
        pageTitle: nameFieldMetadataItem.label,
      }),
    );
  });

  it('should do nothing for a field that no longer exists', () => {
    const { result } = renderOpenSettingsFieldMetadataInSidePanel();

    act(() =>
      result.current.openSettingsFieldMetadataInSidePanel({
        fieldMetadataId: '33333333-3333-4333-8333-333333333333',
      }),
    );

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
