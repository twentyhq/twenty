import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';

import { WorkspaceTargetArtifactHostContext } from '@/navigation/contexts/WorkspaceTargetArtifactHostContext';
import { useOpenWorkspaceTarget } from '@/navigation/hooks/useOpenWorkspaceTarget';
import { type View } from '@/views/types/View';
import {
  ViewKey,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const mockOpenSettingsMenu = jest.fn();
const mockOpenSidePanelArtifact = jest.fn();
const mockOpenRecordInSidePanel = jest.fn();

jest.mock('@/navigation/hooks/useOpenSettings', () => ({
  useOpenSettingsMenu: () => ({
    openSettingsMenu: mockOpenSettingsMenu,
  }),
}));

jest.mock('@/side-panel/artifacts/hooks/useOpenSidePanelArtifact', () => ({
  useOpenSidePanelArtifact: () => ({
    openSidePanelArtifact: mockOpenSidePanelArtifact,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const companyNameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '22222222-2222-4222-8222-222222222222';

const allCompaniesView: View = {
  id: VIEW_ID,
  name: 'All Companies',
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  objectMetadataId: companyObjectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconBuildingSkyscraper',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};

const recordPath = getAppPath(AppPath.RecordShowPage, {
  objectNameSingular: companyObjectMetadataItem.nameSingular,
  objectRecordId: RECORD_ID,
});
const recordIndexPath = getAppPath(
  AppPath.RecordIndexPage,
  { objectNamePlural: companyObjectMetadataItem.namePlural },
  { viewId: VIEW_ID },
);
const settingsFieldPath = getSettingsPath(SettingsPath.ObjectFieldEdit, {
  objectNamePlural: companyObjectMetadataItem.namePlural,
  fieldName: companyNameFieldMetadataItem.name,
});

const renderOpenWorkspaceTarget = ({
  canHostArtifacts,
}: {
  canHostArtifacts: boolean;
}) => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(store, [companyObjectMetadataItem]);
  setTestViewsInMetadataStore(store, [allCompaniesView]);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <MemoryRouter
        initialEntries={['/chat']}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <WorkspaceTargetArtifactHostContext.Provider value={canHostArtifacts}>
          {children}
        </WorkspaceTargetArtifactHostContext.Provider>
      </MemoryRouter>
    </JotaiProvider>
  );

  const hook = renderHook(
    () => {
      const { openWorkspaceTarget } = useOpenWorkspaceTarget();
      const location = useLocation();

      return { openWorkspaceTarget, location };
    },
    { wrapper },
  );

  return { ...hook, store };
};

describe('useOpenWorkspaceTarget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates a hosted record to the semantic record opener', () => {
    const { result } = renderOpenWorkspaceTarget({ canHostArtifacts: true });
    const exactRecordPath = `${recordPath}?tab=timeline#activity`;

    act(() => result.current.openWorkspaceTarget({ path: exactRecordPath }));

    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
      objectNameSingular: companyObjectMetadataItem.nameSingular,
      recordId: RECORD_ID,
      artifactPath: exactRecordPath,
    });
    expect(mockOpenSidePanelArtifact).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/chat');
  });

  it.each([
    ['record index', recordIndexPath],
    ['settings field', settingsFieldPath],
  ])('delegates a hosted %s to the generic artifact opener', (_label, path) => {
    const { result } = renderOpenWorkspaceTarget({ canHostArtifacts: true });

    act(() => result.current.openWorkspaceTarget({ path }));

    expect(mockOpenSidePanelArtifact).toHaveBeenCalledWith({
      artifactPath: path,
    });
    expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/chat');
  });

  it('navigates canonically when the current surface cannot host artifacts', () => {
    const { result } = renderOpenWorkspaceTarget({ canHostArtifacts: false });

    act(() => result.current.openWorkspaceTarget({ path: recordPath }));

    expect(result.current.location.pathname).toBe(recordPath);
    expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    expect(mockOpenSidePanelArtifact).not.toHaveBeenCalled();
    expect(mockOpenSettingsMenu).not.toHaveBeenCalled();
  });

  it('opens the settings menu before navigating to an unhosted settings target', () => {
    const { result } = renderOpenWorkspaceTarget({ canHostArtifacts: false });

    act(() => result.current.openWorkspaceTarget({ path: settingsFieldPath }));

    expect(mockOpenSettingsMenu).toHaveBeenCalledTimes(1);
    expect(
      `${result.current.location.pathname}${result.current.location.search}`,
    ).toBe(settingsFieldPath);
    expect(mockOpenSidePanelArtifact).not.toHaveBeenCalled();
  });

  it('does nothing when hosted target metadata disappears before activation', () => {
    const { result, store } = renderOpenWorkspaceTarget({
      canHostArtifacts: true,
    });

    act(() => {
      setTestObjectMetadataItemsInMetadataStore(store, []);
      result.current.openWorkspaceTarget({ path: recordPath });
    });

    expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    expect(mockOpenSidePanelArtifact).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/chat');
  });

  it('does not gate canonical navigation on side-panel projection metadata', () => {
    const { result, store } = renderOpenWorkspaceTarget({
      canHostArtifacts: false,
    });

    act(() => {
      setTestObjectMetadataItemsInMetadataStore(store, []);
      result.current.openWorkspaceTarget({ path: recordPath });
    });

    expect(result.current.location.pathname).toBe(recordPath);
    expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    expect(mockOpenSidePanelArtifact).not.toHaveBeenCalled();
  });
});
