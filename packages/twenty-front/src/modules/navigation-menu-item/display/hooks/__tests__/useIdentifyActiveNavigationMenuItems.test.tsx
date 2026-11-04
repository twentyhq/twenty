import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const PEOPLE_VIEW_ID = 'people-view-id';

const WORKFLOWS_NATIVE_PAGE_ITEM: NavigationMenuItem = {
  id: 'workflows-native-page-item',
  type: NavigationMenuItemType.NATIVE_PAGE,
  nativePageKey: 'workflows',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const PEOPLE_VIEW_ITEM: NavigationMenuItem = {
  id: 'people-view-item',
  type: NavigationMenuItemType.VIEW,
  viewId: PEOPLE_VIEW_ID,
  position: 1,
  createdAt: '',
  updatedAt: '',
};

const WORKFLOWS_LINK_ITEM: NavigationMenuItem = {
  id: 'workflows-link-item',
  type: NavigationMenuItemType.LINK,
  link: '/workflows',
  position: 2,
  createdAt: '',
  updatedAt: '',
};

const renderUseIdentifyActiveNavigationMenuItems = (pathname: string) => {
  jotaiStore.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: [
      WORKFLOWS_NATIVE_PAGE_ITEM,
      PEOPLE_VIEW_ITEM,
      WORKFLOWS_LINK_ITEM,
    ],
    draft: [],
    status: 'up-to-date',
  });
  jotaiStore.set(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    PEOPLE_VIEW_ID,
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    </JotaiProvider>
  );

  return renderHook(() => useIdentifyActiveNavigationMenuItems(), { wrapper })
    .result.current.activeNavigationMenuItemIds;
};

describe('useIdentifyActiveNavigationMenuItems', () => {
  it('highlights the native page and links to it, not the view left in the context store', () => {
    expect(renderUseIdentifyActiveNavigationMenuItems('/workflows')).toEqual([
      WORKFLOWS_NATIVE_PAGE_ITEM.id,
      WORKFLOWS_LINK_ITEM.id,
    ]);
  });

  it('highlights the view off native pages', () => {
    expect(
      renderUseIdentifyActiveNavigationMenuItems('/objects/people'),
    ).toEqual([PEOPLE_VIEW_ITEM.id]);
  });
});
