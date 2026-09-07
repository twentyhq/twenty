import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';
import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const openRoutedPageInSidePanelMock = jest.fn();
const openRecordInSidePanelMock = jest.fn();

jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: openRoutedPageInSidePanelMock,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: openRecordInSidePanelMock,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '44444444-4444-4444-4444-444444444444';
const ROLE_ID = '55555555-5555-4555-8555-555555555555';
const APPLICATION_ID = '66666666-6666-4666-8666-666666666666';
const UNKNOWN_ID = '77777777-7777-4777-8777-777777777777';

const allCompaniesView = {
  id: VIEW_ID,
  name: 'All Companies',
  icon: 'IconBuildingSkyscraper',
  objectMetadataId: companyObjectMetadataItem.id,
  isActive: true,
} as ViewWithRelations;

const ALL_PERMISSION_FLAGS = [
  PermissionFlagType.DATA_MODEL,
  PermissionFlagType.ROLES,
  PermissionFlagType.APPLICATIONS,
];

const asMatch = (
  reference: ChatReferenceIdentity & { displayName: string },
): ChatReferenceMatch => ({ ...reference, fullMatch: '', index: 0 });

const referenceCases: Array<{
  reference: ChatReferenceMatch;
  href: string;
  permissionFlag?: PermissionFlagType;
}> = [
  {
    reference: asMatch({
      kind: 'record',
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      displayName: 'Acme',
    }),
    href: `/object/company/${RECORD_ID}`,
  },
  {
    reference: asMatch({
      kind: 'records',
      objectMetadataId: companyObjectMetadataItem.id,
      displayName: 'Companies',
    }),
    href: '/objects/companies',
  },
  {
    reference: asMatch({
      kind: 'object',
      objectNameSingular: 'company',
      displayName: 'Companies',
    }),
    href: '/settings/objects/companies',
    permissionFlag: PermissionFlagType.DATA_MODEL,
  },
  {
    reference: asMatch({
      kind: 'field',
      objectNameSingular: 'company',
      fieldName: 'name',
      displayName: 'Name',
    }),
    href: '/settings/objects/companies/name',
    permissionFlag: PermissionFlagType.DATA_MODEL,
  },
  {
    reference: asMatch({
      kind: 'view',
      viewId: VIEW_ID,
      displayName: 'All Companies',
    }),
    href: `/objects/companies?viewId=${VIEW_ID}`,
  },
  {
    reference: asMatch({ kind: 'role', roleId: ROLE_ID, displayName: 'Admin' }),
    href: `/settings/members/roles/${ROLE_ID}`,
    permissionFlag: PermissionFlagType.ROLES,
  },
  {
    reference: asMatch({
      kind: 'app',
      applicationId: APPLICATION_ID,
      displayName: 'Twenty',
    }),
    href: `/settings/applications/${APPLICATION_ID}`,
    permissionFlag: PermissionFlagType.APPLICATIONS,
  },
];

const findCase = (kind: ChatReferenceIdentity['kind']) =>
  referenceCases.find(({ reference }) => reference.kind === kind)!;

const LocationProbe = () => {
  const location = useLocation();

  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderWithReferences = (
  children: ReactNode,
  {
    permissionFlags = ALL_PERMISSION_FLAGS,
    views = [allCompaniesView],
    initialPath = '/objects/companies',
    isNavigationEnabled = true,
    isWorkspaceSetupChat = false,
  }: {
    permissionFlags?: PermissionFlagType[];
    views?: ViewWithRelations[];
    initialPath?: string;
    isNavigationEnabled?: boolean;
    isWorkspaceSetupChat?: boolean;
  } = {},
) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      setTestViewsInMetadataStore(store, views);
      store.set(currentUserWorkspaceState.atom, {
        permissionFlags,
        twoFactorAuthenticationMethodSummary: [],
        objectsPermissions: [],
      });
      store.set(
        shouldOpenAiChatAfterOnboardingState.atom,
        isWorkspaceSetupChat,
      );
    },
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ChatReferenceNavigationEnabledContext.Provider
        value={isNavigationEnabled}
      >
        {children}
        <LocationProbe />
      </ChatReferenceNavigationEnabledContext.Provider>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

const clickChip = (label: string) => {
  const link = screen.getByText(label).closest('a') as HTMLElement;

  fireEvent.mouseDown(link);
  fireEvent.click(link);
};

describe('ChatReferenceChip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(referenceCases)(
    'should link a $reference.kind reference to $href',
    ({ reference, href }) => {
      renderWithReferences(<ChatReferenceChip reference={reference} />);

      expect(
        screen.getByText(reference.displayName).closest('a'),
      ).toHaveAttribute('href', href);
    },
  );

  it.each(
    referenceCases.filter((testCase) => isDefined(testCase.permissionFlag)),
  )(
    'should render a $reference.kind chip without a link when its settings are forbidden',
    ({ reference }) => {
      renderWithReferences(<ChatReferenceChip reference={reference} />, {
        permissionFlags: [],
      });

      expect(screen.getByText(reference.displayName).closest('a')).toBeNull();
      expect(screen.getByTestId('chip')).toBeInTheDocument();
    },
  );

  it.each(
    referenceCases.filter(
      ({ reference }) =>
        reference.kind !== 'record' && reference.kind !== 'app',
    ),
  )(
    'should open a $reference.kind reference beside the chat instead of navigating',
    ({ reference, href }) => {
      renderWithReferences(<ChatReferenceChip reference={reference} />, {
        initialPath: '/chat',
      });

      clickChip(reference.displayName);

      expect(openRoutedPageInSidePanelMock).toHaveBeenCalledWith({
        path: href,
      });
      expect(screen.getByTestId('location-probe')).toHaveTextContent('/chat');
    },
  );

  it('should open a record in the record side panel from the chat page', () => {
    renderWithReferences(
      <ChatReferenceChip reference={findCase('record').reference} />,
      { initialPath: '/chat' },
    );

    clickChip('Acme');

    expect(openRecordInSidePanelMock).toHaveBeenCalledWith({
      recordId: RECORD_ID,
      objectNameSingular: 'company',
    });
  });

  it('should navigate to the application settings from the chat page since they have no side panel route', () => {
    renderWithReferences(
      <ChatReferenceChip reference={findCase('app').reference} />,
      { initialPath: '/chat' },
    );

    clickChip('Twenty');

    expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      `/settings/applications/${APPLICATION_ID}`,
    );
  });

  it.each([
    { name: 'outside the chat page', initialPath: '/objects/companies' },
    {
      name: 'on the workspace setup chat',
      initialPath: '/chat',
      isWorkspaceSetupChat: true,
    },
  ])(
    'should navigate instead of opening a side panel $name',
    ({ initialPath, isWorkspaceSetupChat }) => {
      const { reference, href } = findCase('view');

      renderWithReferences(<ChatReferenceChip reference={reference} />, {
        initialPath,
        isWorkspaceSetupChat,
      });

      clickChip(reference.displayName);

      expect(openRoutedPageInSidePanelMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('location-probe')).toHaveTextContent(href);
    },
  );

  it.each([
    {
      name: 'a record of an unknown object',
      reference: asMatch({
        kind: 'record',
        objectNameSingular: 'partner',
        recordId: RECORD_ID,
        displayName: 'Acme',
      }),
    },
    {
      name: 'an unknown object metadata id',
      reference: asMatch({
        kind: 'records',
        objectMetadataId: UNKNOWN_ID,
        displayName: 'Companies',
      }),
    },
    {
      name: 'an unknown view id',
      reference: asMatch({
        kind: 'view',
        viewId: UNKNOWN_ID,
        displayName: 'All Companies',
      }),
    },
    {
      name: 'an archived view',
      reference: findCase('view').reference,
      views: [{ ...allCompaniesView, isActive: false }],
    },
  ])('should render plain text for $name', ({ reference, views }) => {
    renderWithReferences(<ChatReferenceChip reference={reference} />, {
      views,
    });

    expect(screen.getByText(reference.displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });

  it.each([
    {
      name: 'an object that does not exist yet',
      reference: asMatch({
        kind: 'object',
        objectNameSingular: 'partner',
        displayName: 'Partners',
      }),
    },
    {
      name: 'a field that does not exist yet',
      reference: asMatch({
        kind: 'field',
        objectNameSingular: 'company',
        fieldName: 'annualContractValue',
        displayName: 'Annual contract value',
      }),
    },
  ])('should render a chip without a link for $name', ({ reference }) => {
    renderWithReferences(<ChatReferenceChip reference={reference} />);

    expect(screen.getByText(reference.displayName).closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });

  it('should render a static chip when navigation is disabled', () => {
    renderWithReferences(
      <ChatReferenceChip reference={findCase('role').reference} />,
      { isNavigationEnabled: false },
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    const chipClassName = screen.getByTestId('chip').className;

    expect(chipClassName).not.toMatch(/cursorPointer/);
    expect(chipClassName).toMatch(/backgroundStatic/);
  });
});

describe('TextWithChatReferences', () => {
  it('should render chips inside the surrounding text', () => {
    renderWithReferences(
      <TextWithChatReferences
        text={`Open the [[view:${VIEW_ID}:All Companies]] view`}
      />,
    );

    expect(screen.getByText('All Companies').closest('a')).toHaveAttribute(
      'href',
      `/objects/companies?viewId=${VIEW_ID}`,
    );
    expect(screen.getByText(/Open the/)).toHaveTextContent(
      'Open the All Companies view',
    );
  });

  it('should render the label of a retired id-addressed field reference as plain text', () => {
    renderWithReferences(
      <TextWithChatReferences
        text={`Sort by [[field:${UNKNOWN_ID}:Stage]] first`}
      />,
    );

    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
    expect(screen.getByText(/Sort by/)).toHaveTextContent(
      'Sort by Stage first',
    );
  });
});
