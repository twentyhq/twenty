import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: undefined, loading: false, error: undefined }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeNonSystemObjectMetadataItems: [],
  }),
}));
jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection',
  () => ({
    useNavigationMenuObjectMetadataForSection: () => ({
      views: [],
      objectMetadataIdsWithIndexView: new Set(),
      objectMetadataIdsAlreadyAdded: new Set(),
      viewIdsAlreadyAdded: new Set(),
    }),
  }),
);
jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemSearchRecords',
  () => ({
    useNavigationMenuItemSearchRecords: () => ({
      navigationMenuItemSearchRecords: [],
      recordSearchLoading: false,
      isSearchDebouncing: false,
    }),
  }),
);

const renderAddOptions = (section: NavigationMenuItemSection) => {
  const addItem = jest.fn();
  const store = createStore();

  const { result } = renderHook(
    () =>
      useNavigationMenuItemAddOptions({
        step: 'main',
        search: '',
        objectId: null,
        section,
        currentItems: [],
        isSearchingAllItems: false,
        addItem,
        navigateToStep: jest.fn(),
        selectObject: jest.fn(),
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>{children}</Provider>
        </I18nProvider>
      ),
    },
  );

  return { items: result.current.getItems(), addItem };
};

describe('useNavigationMenuItemAddOptions', () => {
  it('offers a divider in the workspace section', () => {
    const { items, addItem } = renderAddOptions('workspace');
    const dividerOption = items.find(({ id }) => id === 'divider');

    expect(dividerOption).toBeDefined();

    dividerOption?.onClick?.();

    expect(addItem).toHaveBeenCalledWith({
      type: NavigationMenuItemType.DIVIDER,
    });
  });

  it('does not offer a divider in favorites', () => {
    const { items } = renderAddOptions('favorite');

    expect(items.some(({ id }) => id === 'divider')).toBe(false);
  });
});
