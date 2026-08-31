import { act, renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import {
  AppPath,
  ContextStorePageType,
  SettingsPath,
} from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { useOpenSidePanelArtifact } from '@/side-panel/artifacts/hooks/useOpenSidePanelArtifact';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { type View } from '@/views/types/View';
import {
  ViewKey,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(),
}));

const mockV4 = v4 as unknown as jest.Mock<string, []>;

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const companyNameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '22222222-2222-4222-8222-222222222222';
const MAIN_VIEW_ID = '33333333-3333-4333-8333-333333333333';

const companiesByStageView: View = {
  id: VIEW_ID,
  name: 'Companies by stage',
  type: ViewType.KANBAN,
  key: ViewKey.INDEX,
  objectMetadataId: companyObjectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconLayoutKanban',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};

const recordPath = `${getAppPath(AppPath.RecordShowPage, {
  objectNameSingular: companyObjectMetadataItem.nameSingular,
  objectRecordId: RECORD_ID,
})}?from=chat#timeline`;

const recordIndexPath = `${getAppPath(
  AppPath.RecordIndexPage,
  { objectNamePlural: companyObjectMetadataItem.namePlural },
  { viewId: VIEW_ID },
)}#board`;

const settingsFieldPath = `${getSettingsPath(SettingsPath.ObjectFieldEdit, {
  objectNamePlural: companyObjectMetadataItem.namePlural,
  fieldName: companyNameFieldMetadataItem.name,
})}?from=chat`;

const readArtifactContext = (store: Store, instanceId: string) => ({
  objectMetadataItemId: store.get(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId,
    }),
  ),
  targetedRecordsRule: store.get(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({ instanceId }),
  ),
  numberOfSelectedRecords: store.get(
    contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
      instanceId,
    }),
  ),
  pageType: store.get(
    contextStoreCurrentPageTypeComponentState.atomFamily({ instanceId }),
  ),
  viewId: store.get(
    contextStoreCurrentViewIdComponentState.atomFamily({ instanceId }),
  ),
  viewType: store.get(
    contextStoreCurrentViewTypeComponentState.atomFamily({ instanceId }),
  ),
});

const renderOpenSidePanelArtifact = () => {
  let store: Store | undefined;

  const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
    apolloMocks: [],
    componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
    contextStoreCurrentObjectMetadataNameSingular:
      companyObjectMetadataItem.nameSingular,
    contextStoreCurrentViewId: MAIN_VIEW_ID,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [],
    },
    contextStoreNumberOfSelectedRecords: 0,
    contextStoreCurrentViewType: ContextStoreViewType.Table,
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;
      setTestViewsInMetadataStore(initializedStore, [companiesByStageView]);
      initializedStore.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        MAIN_VIEW_ID,
      );
    },
  });

  const hook = renderHook(
    () => {
      const { openSidePanelArtifact } = useOpenSidePanelArtifact();
      const { getIcon } = useIcons();

      return { openSidePanelArtifact, getIcon };
    },
    { wrapper },
  );

  if (store === undefined) {
    throw new Error('Jotai store was not initialized');
  }

  return { ...hook, store };
};

describe('useOpenSidePanelArtifact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockV4.mockReset();
  });

  it('opens a record with its exact path and seeds its record context', () => {
    mockV4.mockReturnValue('record-page-id');
    const { result, store } = renderOpenSidePanelArtifact();

    let didOpenArtifact = false;

    act(() => {
      didOpenArtifact = result.current.openSidePanelArtifact({
        artifactPath: recordPath,
      });
    });

    expect(didOpenArtifact).toBe(true);
    expect(store.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: recordPath,
        pageTitle: companyObjectMetadataItem.labelSingular,
        pageIcon: result.current.getIcon(
          companyObjectMetadataItem.icon ?? 'IconList',
        ),
        pageIconColor: getIconColorForObjectType(
          companyObjectMetadataItem.nameSingular,
        ),
        pageId: 'record-page-id',
      },
    ]);
    expect(readArtifactContext(store, 'record-page-id')).toEqual({
      objectMetadataItemId: companyObjectMetadataItem.id,
      targetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: [RECORD_ID],
      },
      numberOfSelectedRecords: 1,
      pageType: ContextStorePageType.Record,
      viewId: MAIN_VIEW_ID,
      viewType: null,
    });
    expect(store.get(sidePanelNavigationMorphItemsByPageState.atom)).toEqual(
      new Map([
        [
          'record-page-id',
          [
            {
              objectMetadataId: companyObjectMetadataItem.id,
              recordId: RECORD_ID,
            },
          ],
        ],
      ]),
    );
  });

  it('opens an index with its exact path and seeds its view context', () => {
    mockV4.mockReturnValue('index-page-id');
    const { result, store } = renderOpenSidePanelArtifact();

    act(() => {
      result.current.openSidePanelArtifact({ artifactPath: recordIndexPath });
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: recordIndexPath,
        pageTitle: companiesByStageView.name,
        pageIcon: result.current.getIcon(companiesByStageView.icon),
        pageIconColor: undefined,
        pageId: 'index-page-id',
      },
    ]);
    expect(readArtifactContext(store, 'index-page-id')).toEqual({
      objectMetadataItemId: companyObjectMetadataItem.id,
      targetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: [],
      },
      numberOfSelectedRecords: 0,
      pageType: ContextStorePageType.Index,
      viewId: VIEW_ID,
      viewType: ContextStoreViewType.Kanban,
    });
    expect(store.get(sidePanelNavigationMorphItemsByPageState.atom)).toEqual(
      new Map(),
    );
  });

  it('opens a field without seeding record context', () => {
    const pageId = 'settings-field-page-id';

    mockV4.mockReturnValue(pageId);
    const { result, store } = renderOpenSidePanelArtifact();

    act(() => {
      result.current.openSidePanelArtifact({
        artifactPath: settingsFieldPath,
      });
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: settingsFieldPath,
        pageTitle: companyNameFieldMetadataItem.label,
        pageIcon: result.current.getIcon(companyNameFieldMetadataItem.icon),
        pageIconColor: undefined,
        pageId,
      },
    ]);
    expect(readArtifactContext(store, pageId)).toEqual({
      objectMetadataItemId: undefined,
      targetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: [],
      },
      numberOfSelectedRecords: 0,
      pageType: null,
      viewId: undefined,
      viewType: null,
    });
    expect(store.get(sidePanelNavigationMorphItemsByPageState.atom)).toEqual(
      new Map(),
    );
  });

  it('does nothing when the artifact metadata became stale', () => {
    mockV4.mockReturnValue('unused-page-id');
    const { result, store } = renderOpenSidePanelArtifact();
    const staleFieldPath = getSettingsPath(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: companyObjectMetadataItem.namePlural,
      fieldName: 'missingField',
    });

    let didOpenArtifact = true;

    act(() => {
      didOpenArtifact = result.current.openSidePanelArtifact({
        artifactPath: staleFieldPath,
      });
    });

    expect(didOpenArtifact).toBe(false);
    expect(mockV4).not.toHaveBeenCalled();
    expect(store.get(sidePanelNavigationStackState.atom)).toEqual([]);
    expect(store.get(sidePanelNavigationMorphItemsByPageState.atom)).toEqual(
      new Map(),
    );
  });

  it('reuses an exact current path and adds a different path to history', () => {
    mockV4
      .mockReturnValueOnce('first-record-page-id')
      .mockReturnValueOnce('second-record-page-id');
    const { result, store } = renderOpenSidePanelArtifact();

    let didOpenFirstPath = false;
    let didOpenRepeatedPath = true;
    let didOpenDifferentPath = false;

    act(() => {
      didOpenFirstPath = result.current.openSidePanelArtifact({
        artifactPath: recordPath,
      });
      didOpenRepeatedPath = result.current.openSidePanelArtifact({
        artifactPath: recordPath,
      });
      didOpenDifferentPath = result.current.openSidePanelArtifact({
        artifactPath: `${recordPath}#details`,
      });
    });

    expect(didOpenFirstPath).toBe(true);
    expect(didOpenRepeatedPath).toBe(false);
    expect(didOpenDifferentPath).toBe(true);
    expect(mockV4).toHaveBeenCalledTimes(2);
    expect(
      store
        .get(sidePanelNavigationStackState.atom)
        .map(({ pageId, artifactPath }) => ({ pageId, artifactPath })),
    ).toEqual([
      { pageId: 'first-record-page-id', artifactPath: recordPath },
      {
        pageId: 'second-record-page-id',
        artifactPath: `${recordPath}#details`,
      },
    ]);
  });
});
