import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { agentChatThreadPreviewsState } from '@/ai/states/agentChatThreadPreviewsState';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const ACME_ID = '20202020-0000-4000-8000-000000000002';
const GLOBEX_ID = '20202020-0000-4000-8000-000000000003';
const OWNER_ID = '20202020-0000-4000-8000-000000000010';
const WRITER_ID = '20202020-0000-4000-8000-000000000011';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
// The test workspace has no conversation objects; person.company stands in for the company leg.
const companyTargetField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});

const attachChatThreadToRecord = jest.fn(() => Promise.resolve(true));
const detachChatThreadFromRecord = jest.fn((_linkIds: string[]) =>
  Promise.resolve(),
);
const refetchThread = jest.fn(() => Promise.resolve());
const mockThread: { current: ObjectRecord | undefined } = {
  current: undefined,
};

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord }),
}));

jest.mock('@/ai/hooks/useDetachChatThreadFromRecord', () => ({
  useDetachChatThreadFromRecord: () => ({
    detachChatThreadFromRecord: (linkIds: string[]) =>
      detachChatThreadFromRecord(linkIds),
  }),
}));

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({
    record: mockThread.current,
    refetch: refetchThread,
  }),
}));

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: jest.fn(),
}));

// Previews are seeded in the store; MockedProvider can't answer the request.
jest.mock('@/ai/components/AgentChatThreadPreviewsEffect', () => ({
  AgentChatThreadPreviewsEffect: () => null,
}));

jest.mock('@/object-record/hooks/useObjectRecordSearchRecords', () => ({
  useObjectRecordSearchRecords: ({ searchInput }: { searchInput: string }) => ({
    searchRecords:
      searchInput === 'Globex'
        ? [
            {
              __typename: 'SearchRecord',
              recordId: GLOBEX_ID,
              objectNameSingular: 'company',
              objectLabelSingular: 'Company',
              label: 'Globex',
              imageUrl: null,
              tsRankCD: 1,
              tsRank: 1,
            },
          ]
        : [],
    loading: false,
  }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => ({
      junctionObjectMetadata: personObjectMetadataItem,
      junctionField: { ...companyTargetField, name: 'recordTargets' },
      targetFields: [companyTargetField],
      isMorphRelation: true,
      isValid: true,
    }),
  }),
);

const EDITABLE_PERMISSIONS = {
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSoftDelete: true,
};

const CHAT_THREAD_OBJECT_METADATA_ITEM = {
  ...getMockObjectMetadataItemOrThrow('note'),
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [],
  readableFields: [],
  updatableFields: [],
  indexMetadatas: [],
};

const ACME_LINK: ObjectRecord = {
  __typename: 'AgentChatThreadTarget',
  id: 'link-1',
  company: { __typename: 'Company', id: ACME_ID, name: 'Acme' },
};

const buildThread = (recordTargets: ObjectRecord[] = [ACME_LINK]) => ({
  __typename: 'AgentChatThread',
  id: THREAD_ID,
  recordTargets,
});

const buildWorkspaceMember = (id: string, firstName: string) => ({
  id,
  userId: `user-${id}`,
  name: { firstName, lastName: 'Member' },
  colorScheme: 'Light' as const,
  locale: 'en',
  userEmail: `${firstName.toLowerCase()}@example.com`,
  avatarUrl: null,
});

const renderDetails = ({
  permissions = EDITABLE_PERMISSIONS,
  isConversationsTabEnabled = true,
}: {
  permissions?: typeof EDITABLE_PERMISSIONS;
  isConversationsTabEnabled?: boolean;
} = {}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [
      ...getTestEnrichedObjectMetadataItemsMock(),
      CHAT_THREAD_OBJECT_METADATA_ITEM,
    ],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          {
            key: FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
            value: isConversationsTabEnabled,
          },
        ],
      });
      setAgentChatThreadPermissions(store, THREAD_ID, permissions);
      store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
        __typename: 'AgentChatThread',
        id: THREAD_ID,
        title: 'Pricing questions',
        deletedAt: null,
        workspaceMemberId: OWNER_ID,
        lastActivityAt: '2026-10-01T10:00:00.000Z',
      });
      store.set(currentWorkspaceMembersState.atom, [
        buildWorkspaceMember(OWNER_ID, 'Owner'),
        buildWorkspaceMember(WRITER_ID, 'Writer'),
      ]);
      store.set(agentChatThreadPreviewsState.atom, {
        [THREAD_ID]: {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          preview: { threadId: THREAD_ID, memberIds: [WRITER_ID, OWNER_ID] },
        },
      });
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataAndApolloMocksWrapper>
      <PreComputedChipGeneratorsProvider>
        <I18nProvider i18n={i18n}>
          <MemoryRouter>{children}</MemoryRouter>
        </I18nProvider>
      </PreComputedChipGeneratorsProvider>
    </MetadataAndApolloMocksWrapper>
  );

  render(<AiChatThreadDetailsDropdown threadId={THREAD_ID} />, {
    wrapper: Wrapper,
  });
};

const openDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Chat details' }));
};

describe('AiChatThreadDetailsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThread.current = buildThread();
  });

  it('shows the linked records and the members following the chat', async () => {
    const user = userEvent.setup();

    renderDetails();
    await openDetails(user);

    expect(await screen.findByText('Acme')).toBeVisible();
    expect(screen.getByText('Owner Member')).toBeVisible();
    expect(screen.getByText('Writer Member')).toBeVisible();
  });

  it('links a record found by search', async () => {
    const user = userEvent.setup();

    renderDetails();
    await openDetails(user);
    await user.click(
      await screen.findByRole('button', { name: 'Edit linked records' }),
    );
    await user.type(
      await screen.findByRole('searchbox', { name: 'Search records' }),
      'Globex',
    );
    await user.click(
      await screen.findByRole('button', { name: /Globex/, pressed: false }),
    );

    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      objectNameSingular: 'company',
      recordId: GLOBEX_ID,
    });
  });

  it('unlinks every link between the chat and a linked record', async () => {
    const user = userEvent.setup();
    mockThread.current = buildThread([
      ACME_LINK,
      { ...ACME_LINK, id: 'link-2' },
      {
        __typename: 'AgentChatThreadTarget',
        id: 'link-3',
        company: { __typename: 'Company', id: GLOBEX_ID, name: 'Globex' },
      },
    ]);

    renderDetails();
    await openDetails(user);
    await user.click(
      await screen.findByRole('button', { name: 'Edit linked records' }),
    );
    await user.click(
      await screen.findByRole('button', { name: /Acme/, pressed: true }),
    );

    expect(detachChatThreadFromRecord).toHaveBeenCalledWith([
      'link-1',
      'link-2',
    ]);
    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('offers to link a record when the chat has none', async () => {
    const user = userEvent.setup();
    mockThread.current = buildThread([]);

    renderDetails();
    await openDetails(user);

    expect(
      await screen.findByRole('button', { name: 'Link to a record' }),
    ).toBeVisible();
  });

  it('shows the links read-only to a shared viewer', async () => {
    const user = userEvent.setup();

    renderDetails({
      permissions: { ...EDITABLE_PERMISSIONS, canUpdate: false },
    });
    await openDetails(user);

    expect(await screen.findByText('Acme')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit linked records' }),
    ).not.toBeInTheDocument();
  });

  it('reads the links again when one is written elsewhere', async () => {
    renderDetails();
    await screen.findByRole('button', { name: 'Chat details' });

    act(() => {
      dispatchObjectRecordOperationBrowserEvent({
        objectMetadataItem: personObjectMetadataItem,
        operation: {
          type: 'create-one',
          createdRecord: { id: 'link-2', threadId: THREAD_ID },
        },
      });
    });

    expect(refetchThread).toHaveBeenCalledTimes(1);
  });

  it('leaves out the linked records until the conversations tab is enabled', async () => {
    const user = userEvent.setup();

    renderDetails({ isConversationsTabEnabled: false });
    await openDetails(user);

    expect(await screen.findByText('Owner Member')).toBeVisible();
    expect(screen.queryByText('Linked to')).not.toBeInTheDocument();
  });
});
