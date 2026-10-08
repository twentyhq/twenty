import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
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

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
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
const performSearch = jest.fn();
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

const refetchThread = jest.fn(() => Promise.resolve());

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({
    record: mockThread.current,
    refetch: refetchThread,
  }),
}));

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: jest.fn(),
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

// MockedProvider can't answer the picker's network search.
jest.mock(
  '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch',
  () => ({
    useMultipleRecordPickerPerformSearch: () => ({ performSearch }),
  }),
);

jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker',
  () => ({
    MultipleRecordPicker: ({
      onChange,
    }: {
      onChange: (morphItem: RecordPickerPickableMorphItem) => void;
    }) => (
      <>
        <button
          onClick={() =>
            onChange({
              recordId: ACME_ID,
              objectMetadataId: companyObjectMetadataItem.id,
              isSelected: false,
              isMatchingSearchFilter: true,
            })
          }
        >
          Unlink Acme
        </button>
        <button
          onClick={() =>
            onChange({
              recordId: GLOBEX_ID,
              objectMetadataId: companyObjectMetadataItem.id,
              isSelected: true,
              isMatchingSearchFilter: true,
            })
          }
        >
          Link Globex
        </button>
      </>
    ),
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

const buildThread = ({
  recordTargets = [ACME_LINK],
}: {
  recordTargets?: ObjectRecord[];
} = {}): ObjectRecord => ({
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

const renderDetails = async ({
  permissions = EDITABLE_PERMISSIONS,
  isConversationsTabEnabled = true,
  isAiChatInboxEnabled = true,
  shouldOpenDetails = true,
}: {
  permissions?: typeof EDITABLE_PERMISSIONS;
  isConversationsTabEnabled?: boolean;
  isAiChatInboxEnabled?: boolean;
  shouldOpenDetails?: boolean;
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
          {
            key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
            value: isAiChatInboxEnabled,
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
        writerWorkspaceMemberIds: [WRITER_ID, OWNER_ID],
      });
      store.set(currentWorkspaceMembersState.atom, [
        buildWorkspaceMember(OWNER_ID, 'Owner'),
        buildWorkspaceMember(WRITER_ID, 'Writer'),
      ]);
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

  if (!shouldOpenDetails) {
    return;
  }

  await userEvent.click(
    await screen.findByRole('button', { name: 'Chat details' }),
  );
};

describe('AiChatThreadDetailsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThread.current = buildThread();
  });

  it('shows the members following the chat', async () => {
    await renderDetails();

    expect(await screen.findByText('Owner Member')).toBeVisible();
    expect(screen.getByText('Writer Member')).toBeVisible();
  });

  it('opens the record picker on the linked records, searching the objects a conversation can be linked to', async () => {
    const user = userEvent.setup();

    await renderDetails();

    expect(await screen.findByText('Acme')).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Edit linked records' }),
    );

    expect(performSearch).toHaveBeenCalledWith({
      multipleRecordPickerInstanceId: expect.stringContaining('record-picker'),
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: [
        expect.objectContaining({ nameSingular: 'company' }),
      ],
      forcePickableMorphItems: [
        {
          recordId: ACME_ID,
          objectMetadataId: companyObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        },
      ],
    });
  });

  it('lets the conversation editor unlink a record', async () => {
    const user = userEvent.setup();

    await renderDetails();

    await user.click(
      await screen.findByRole('button', { name: 'Edit linked records' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Unlink Acme' }),
    );

    expect(detachChatThreadFromRecord).toHaveBeenCalledWith(['link-1']);
    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('lets the conversation editor link a record', async () => {
    const user = userEvent.setup();

    await renderDetails();

    await user.click(
      await screen.findByRole('button', { name: 'Edit linked records' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Link Globex' }),
    );

    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      objectNameSingular: 'company',
      recordId: GLOBEX_ID,
    });
    expect(detachChatThreadFromRecord).not.toHaveBeenCalled();
  });

  it('unlinks every link between the conversation and the record', async () => {
    const user = userEvent.setup();
    mockThread.current = buildThread({
      recordTargets: [
        ACME_LINK,
        { ...ACME_LINK, id: 'link-2' },
        {
          __typename: 'AgentChatThreadTarget',
          id: 'link-3',
          company: { __typename: 'Company', id: GLOBEX_ID, name: 'Globex' },
        },
      ],
    });

    await renderDetails();

    expect(await screen.findAllByText('Acme')).toHaveLength(1);

    await user.click(
      screen.getByRole('button', { name: 'Edit linked records' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Unlink Acme' }),
    );

    expect(detachChatThreadFromRecord).toHaveBeenCalledWith([
      'link-1',
      'link-2',
    ]);
  });

  it('offers to link a record when the conversation has none', async () => {
    mockThread.current = buildThread({ recordTargets: [] });

    await renderDetails();

    expect(
      await screen.findByRole('button', { name: 'Link to a record' }),
    ).toBeVisible();
  });

  it('shows the links read-only to a shared viewer', async () => {
    await renderDetails({
      permissions: { ...EDITABLE_PERMISSIONS, canUpdate: false },
    });

    expect(await screen.findByText('Acme')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit linked records' }),
    ).not.toBeInTheDocument();
  });

  it('reads the links again when one is written elsewhere', async () => {
    await renderDetails();

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

  it('leaves out the assignee and followers while the inbox feature flag is off', async () => {
    await renderDetails({ isAiChatInboxEnabled: false });

    expect(await screen.findByText('Linked to')).toBeVisible();
    expect(screen.queryByText('Assignee')).not.toBeInTheDocument();
    expect(screen.queryByText('Owner Member')).not.toBeInTheDocument();
  });

  it('hides the chat details with neither the inbox nor the conversations tab enabled', async () => {
    await renderDetails({
      isAiChatInboxEnabled: false,
      isConversationsTabEnabled: false,
      shouldOpenDetails: false,
    });

    expect(
      screen.queryByRole('button', { name: 'Chat details' }),
    ).not.toBeInTheDocument();
  });

  it('leaves out the linked records until the conversations tab is enabled', async () => {
    await renderDetails({ isConversationsTabEnabled: false });

    expect(screen.queryByText('Acme')).not.toBeInTheDocument();
  });
});
