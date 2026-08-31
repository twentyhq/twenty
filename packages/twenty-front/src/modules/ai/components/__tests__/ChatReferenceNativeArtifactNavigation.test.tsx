import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type createStore } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataLink } from '@/ai/components/FieldMetadataLink';
import { RecordLink } from '@/ai/components/RecordLink';
import { ViewLink } from '@/ai/components/ViewLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { WorkspaceTargetArtifactHostContext } from '@/navigation/contexts/WorkspaceTargetArtifactHostContext';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { PermissionFlagType, ViewType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

let mockIsMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const VIEW_ID = '44444444-4444-4444-8444-444444444444';
const RECORD_ID = '11111111-1111-4111-8111-111111111111';

const allCompaniesView = {
  id: VIEW_ID,
  name: 'All Companies',
  icon: 'IconBuildingSkyscraper',
  objectMetadataId: companyObjectMetadataItem.id,
  type: ViewType.TABLE,
  position: 0,
  isActive: true,
} as ViewWithRelations;

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderOnChatPage = (element: ReactNode) => {
  let store: ReturnType<typeof createStore> | undefined;

  window.history.pushState({}, '', '/chat');

  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;
      setTestViewsInMetadataStore(initializedStore, [allCompaniesView]);
      initializedStore.set(currentUserWorkspaceState.atom, {
        permissionFlags: [PermissionFlagType.DATA_MODEL],
        twoFactorAuthenticationMethodSummary: [],
        objectsPermissions: [],
      });
    },
  });

  const renderResult = render(
    <MemoryRouter
      initialEntries={['/chat']}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <WorkspaceTargetArtifactHostContext.Provider value={!mockIsMobile}>
        {element}
      </WorkspaceTargetArtifactHostContext.Provider>
      <LocationProbe />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );

  if (!isDefined(store)) {
    throw new Error('Jotai store was not initialized');
  }

  return { ...renderResult, store, user: userEvent.setup() };
};

describe('chat reference native artifact navigation', () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it('should open a record in its native record artifact', async () => {
    const { store, user } = renderOnChatPage(
      <RecordLink
        objectNameSingular={companyObjectMetadataItem.nameSingular}
        recordId={RECORD_ID}
        displayName="Acme"
      />,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      `/object/${companyObjectMetadataItem.nameSingular}/${RECORD_ID}`,
    );

    await user.click(link);

    expect(store.get(sidePanelPageState.atom)).toBe(SIDE_PANEL_ARTIFACT_PAGE);
    expect(store.get(sidePanelNavigationStackState.atom).at(-1)).toMatchObject({
      page: SIDE_PANEL_ARTIFACT_PAGE,
      artifactPath: `/object/${companyObjectMetadataItem.nameSingular}/${RECORD_ID}`,
    });
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/chat');
  });

  it('should leave a modified record click to the browser', async () => {
    const { store, user } = renderOnChatPage(
      <RecordLink
        objectNameSingular={companyObjectMetadataItem.nameSingular}
        recordId={RECORD_ID}
        displayName="Acme"
      />,
    );

    const link = screen.getByRole('link');
    link.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    });

    await user.keyboard('{Control>}');
    await user.click(link);
    await user.keyboard('{/Control}');

    expect(link).toHaveAttribute(
      'href',
      `/object/${companyObjectMetadataItem.nameSingular}/${RECORD_ID}`,
    );
    expect(store.get(isSidePanelOpenedState.atom)).toBe(false);
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/chat');
  });

  it('should open a field in its native metadata artifact', async () => {
    const { store, user } = renderOnChatPage(
      <FieldMetadataLink
        objectNameSingular={companyObjectMetadataItem.nameSingular}
        fieldName={nameFieldMetadataItem.name}
        displayName={nameFieldMetadataItem.label}
      />,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      `/settings/objects/${companyObjectMetadataItem.namePlural}/${nameFieldMetadataItem.name}`,
    );

    await user.click(link);

    expect(store.get(isSidePanelOpenedState.atom)).toBe(true);
    expect(store.get(sidePanelPageState.atom)).toBe(SIDE_PANEL_ARTIFACT_PAGE);
    expect(store.get(sidePanelNavigationStackState.atom).at(-1)).toMatchObject({
      page: SIDE_PANEL_ARTIFACT_PAGE,
      artifactPath: `/settings/objects/${companyObjectMetadataItem.namePlural}/${nameFieldMetadataItem.name}`,
    });
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/chat');
  });

  it('should navigate to field settings instead of opening an artifact on mobile', async () => {
    mockIsMobile = true;

    const { store, user } = renderOnChatPage(
      <FieldMetadataLink
        objectNameSingular={companyObjectMetadataItem.nameSingular}
        fieldName={nameFieldMetadataItem.name}
        displayName={nameFieldMetadataItem.label}
      />,
    );

    await user.click(screen.getByRole('link'));

    expect(store.get(isSidePanelOpenedState.atom)).toBe(false);
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      `/settings/objects/${companyObjectMetadataItem.namePlural}/${nameFieldMetadataItem.name}`,
    );
  });

  it('should keep a view in the compact records artifact', async () => {
    const { store, user } = renderOnChatPage(
      <ViewLink viewId={VIEW_ID} displayName={allCompaniesView.name} />,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      `/objects/${companyObjectMetadataItem.namePlural}?viewId=${VIEW_ID}`,
    );

    await user.click(link);

    expect(store.get(sidePanelPageState.atom)).toBe(SIDE_PANEL_ARTIFACT_PAGE);
    expect(store.get(sidePanelNavigationStackState.atom).at(-1)).toMatchObject({
      page: SIDE_PANEL_ARTIFACT_PAGE,
      artifactPath: `/objects/${companyObjectMetadataItem.namePlural}?viewId=${VIEW_ID}`,
    });
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/chat');
  });
});
