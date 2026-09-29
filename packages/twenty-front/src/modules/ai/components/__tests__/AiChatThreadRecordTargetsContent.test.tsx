import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ComponentProps, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatThreadRecordTargetsContent } from '@/ai/components/AiChatThreadRecordTargetsContent';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const ACME_ID = '20202020-0000-4000-8000-000000000002';
const OTHER_COMPANY_ID = '20202020-0000-4000-8000-000000000003';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
// Any relation to company stands in for the thread target's company leg.
const companyTargetField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});

const attachChatThreadToRecord = jest.fn(() => Promise.resolve(true));
const detachChatThreadFromRecord = jest.fn((_linkIds: string[]) =>
  Promise.resolve(),
);
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
  useFindOneRecord: () => ({ record: mockThread.current }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [companyObjectMetadataItem, personObjectMetadataItem],
  }),
}));

jest.mock(
  '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch',
  () => ({
    useMultipleRecordPickerPerformSearch: () => ({ performSearch: jest.fn() }),
  }),
);

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({ record }: { record: ObjectRecord }) => (
    <span>{record.name}</span>
  ),
}));

jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker',
  () => ({
    MultipleRecordPicker: ({
      onChange,
    }: {
      onChange: (morphItem: RecordPickerPickableMorphItem) => void;
    }) => (
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
    ),
  }),
);

const JUNCTION_CONFIG: ComponentProps<
  typeof AiChatThreadRecordTargetsContent
>['junctionConfig'] = {
  junctionObjectMetadata: personObjectMetadataItem,
  junctionField: { ...companyTargetField, name: 'recordTargets' },
  targetFields: [companyTargetField],
  isMorphRelation: true,
  isValid: true,
};

const EDITABLE_PERMISSIONS = {
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSoftDelete: true,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>{children}</MemoryRouter>
      </I18nProvider>
    </MockedProvider>
  </JotaiProvider>
);

const renderRecordTargets = () =>
  render(
    <AiChatThreadRecordTargetsContent
      threadId={THREAD_ID}
      instanceId="record-targets-test"
      junctionConfig={JUNCTION_CONFIG}
    />,
    { wrapper: Wrapper },
  );

const ACME_LINK: ObjectRecord = {
  __typename: 'AgentChatThreadTarget',
  id: 'link-1',
  company: { __typename: 'Company', id: ACME_ID, name: 'Acme' },
};

const buildThread = ({
  workflowRunId = null,
  recordTargets = [ACME_LINK],
}: {
  workflowRunId?: string | null;
  recordTargets?: ObjectRecord[];
} = {}): ObjectRecord => ({
  __typename: 'AgentChatThread',
  id: THREAD_ID,
  workflowRunId,
  recordTargets,
});

describe('AiChatThreadRecordTargetsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    mockThread.current = buildThread();
    setAgentChatThreadPermissions(jotaiStore, THREAD_ID, EDITABLE_PERMISSIONS);
  });

  it('shows the records the conversation is linked to and lets its editor unlink one', async () => {
    const user = userEvent.setup();

    renderRecordTargets();

    expect(screen.getByText('Acme')).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Edit linked records' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Unlink Acme' }),
    );

    expect(detachChatThreadFromRecord).toHaveBeenCalledWith(['link-1']);
    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  // A custom object leg carries no unique index, so a record can be linked
  // more than once, and unlinking it removes every link.
  it('unlinks every link between the conversation and the record', async () => {
    const user = userEvent.setup();
    mockThread.current = buildThread({
      recordTargets: [
        ACME_LINK,
        { ...ACME_LINK, id: 'link-2' },
        {
          __typename: 'AgentChatThreadTarget',
          id: 'link-3',
          company: {
            __typename: 'Company',
            id: OTHER_COMPANY_ID,
            name: 'Globex',
          },
        },
      ],
    });

    renderRecordTargets();

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

  it('offers to link a record when the conversation has none', () => {
    mockThread.current = buildThread({ recordTargets: [] });

    renderRecordTargets();

    expect(
      screen.getByRole('button', { name: 'Link to a record' }),
    ).toBeVisible();
  });

  it('shows the links read-only to a shared viewer', () => {
    setAgentChatThreadPermissions(jotaiStore, THREAD_ID, {
      ...EDITABLE_PERMISSIONS,
      canUpdate: false,
    });

    renderRecordTargets();

    expect(screen.getByText('Acme')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit linked records' }),
    ).not.toBeInTheDocument();
  });

  it('keeps a workflow run conversation read-only', () => {
    mockThread.current = buildThread({
      workflowRunId: '20202020-0000-4000-8000-0000000000bb',
      recordTargets: [],
    });

    const { container } = renderRecordTargets();

    expect(container).toBeEmptyDOMElement();
  });
});
