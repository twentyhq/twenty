import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { SidePanelPages } from 'twenty-shared/types';
import { Icon123, useIcons } from 'twenty-ui/icon';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const personMockObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'person',
  )!;

const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords: 0,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { navigateSidePanel } = useNavigateSidePanel();

      const { getIcon } = useIcons();

      return {
        navigateSidePanel,
        getIcon,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useNavigateSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(sidePanelNavigationStackState.atom, []);
  });

  it('should navigate to the correct page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.navigateSidePanel({
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Command menu',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Command menu',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
      },
    ]);
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: 'Command menu',
      Icon: Icon123,
      instanceId: 'mocked-uuid',
    });
  });

  it('stores the canonical path on an artifact navigation item', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.navigateSidePanel({
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/objects/companies?viewId=view-id',
        pageTitle: 'Companies',
        pageIcon: Icon123,
        pageId: 'mocked-uuid',
      });
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/objects/companies?viewId=view-id',
        pageTitle: 'Companies',
        pageIcon: Icon123,
        pageId: 'mocked-uuid',
      },
    ]);
  });

  it('rejects an artifact navigation without a canonical path at runtime', () => {
    const { result } = renderHooks();

    expect(() => {
      act(() => {
        result.current.navigateSidePanel({
          page: SIDE_PANEL_ARTIFACT_PAGE,
          pageTitle: 'Companies',
          pageIcon: Icon123,
        } as never);
      });
    }).toThrow('An artifact side-panel page requires a canonical path');
  });
});
