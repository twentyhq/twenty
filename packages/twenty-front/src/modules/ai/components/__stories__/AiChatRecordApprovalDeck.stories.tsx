import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ExtendedUIMessagePart,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const THREAD_ID = 'record-creation-approval-story';

const buildRecordCreation = ({
  objectNameSingular,
  summary,
  recordArguments,
}: {
  objectNameSingular: string;
  summary: string;
  recordArguments: Record<string, unknown>;
}): ProposedToolCall => ({
  toolName: `create_${objectNameSingular}`,
  toolLabel: `Create ${objectNameSingular}`,
  summary,
  arguments: recordArguments,
  template: 'recordCreate',
  objectNameSingular,
});

const [FIRST_PERSON, SECOND_PERSON] = mockedPersonRecords;

const RECORD_UPDATES = [FIRST_PERSON, SECOND_PERSON].map(
  (person): ProposedToolCall => ({
    toolName: 'update_person',
    toolLabel: 'Update person',
    summary: `${person.name.firstName} ${person.name.lastName}`,
    arguments: { id: person.id, jobTitle: 'Head of Sales', city: 'Paris' },
    template: 'recordUpdate',
    objectNameSingular: 'person',
    recordId: person.id,
  }),
);

const RECORD_DELETIONS = [FIRST_PERSON, SECOND_PERSON].map(
  (person): ProposedToolCall => ({
    toolName: 'delete_person',
    toolLabel: 'Delete person',
    summary: `${person.name.firstName} ${person.name.lastName}`,
    arguments: { id: person.id },
    template: 'recordDelete',
    objectNameSingular: 'person',
    recordId: person.id,
  }),
);

const seedPendingProposals = (proposals: ProposedToolCall[]) => {
  const previousThread = jotaiStore.get(agentChatDisplayedThreadState.atom);
  const messagesAtom = agentChatMessagesFamilyState.atomFamily({
    threadId: THREAD_ID,
  });
  const previousMessages = jotaiStore.get(messagesAtom);

  jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  jotaiStore.set(messagesAtom, [
    {
      id: 'pending-record-approvals',
      role: 'assistant',
      parts: proposals.map((proposal, index): ExtendedUIMessagePart => ({
        type: `tool-${PROPOSE_TOOL_CALL_TOOL_NAME}`,
        toolCallId: `record-approval-${index}`,
        state: 'output-available',
        input: {},
        output: { success: true, result: { status: 'pending', proposal } },
      })),
    },
  ]);

  return () => {
    jotaiStore.set(agentChatDisplayedThreadState.atom, previousThread);
    jotaiStore.set(messagesAtom, previousMessages);
  };
};

const RECORD_CREATIONS = [
  buildRecordCreation({
    objectNameSingular: 'person',
    summary: 'Sundar Pichai',
    recordArguments: {
      name: { firstName: 'Sundar', lastName: 'Pichai' },
      jobTitle: 'CEO',
      city: 'Mountain View',
    },
  }),
  buildRecordCreation({
    objectNameSingular: 'person',
    summary: 'Thomas Kurian',
    recordArguments: {
      name: { firstName: 'Thomas', lastName: 'Kurian' },
      jobTitle: 'CEO, Google Cloud',
      city: 'Sunnyvale',
    },
  }),
  buildRecordCreation({
    objectNameSingular: 'person',
    summary: 'Ruth Porat',
    recordArguments: {
      name: { firstName: 'Ruth', lastName: 'Porat' },
      jobTitle: 'President',
      city: 'Palo Alto',
    },
  }),
  buildRecordCreation({
    objectNameSingular: 'company',
    summary: 'Google',
    recordArguments: { name: 'Google', employees: 180000 },
  }),
  buildRecordCreation({
    objectNameSingular: 'company',
    summary: 'Alphabet',
    recordArguments: { name: 'Alphabet', employees: 190000 },
  }),
];

const meta: Meta<typeof AiChatPendingAskGate> = {
  title: 'Modules/AI/AiChatRecordApprovalDeck',
  component: AiChatPendingAskGate,
  decorators: [
    RootDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  parameters: { container: { width: 600 }, msw: graphqlMocks },
  args: { children: 'No pending requests' },
  beforeEach: () => seedPendingProposals(RECORD_CREATIONS),
};

export default meta;
type Story = StoryObj<typeof AiChatPendingAskGate>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Create 3 People')).toBeVisible();
    await expect(await canvas.findByText('Sundar Pichai')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Approve all 2' }),
    ).toBeEnabled();
  },
};

export const SkippedRecord: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('checkbox', { name: 'Select Thomas Kurian' }),
    );

    await expect(
      canvas.getByRole('button', { name: 'Create 2' }),
    ).toBeEnabled();
    await expect(canvas.getByText('2 selected · 1 skipped')).toBeVisible();
  },
};

export const SecondObject: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Next approval' }),
    );

    await expect(await canvas.findByText('Create 2 Companies')).toBeVisible();
    await expect(await canvas.findByText('Alphabet')).toBeVisible();
  },
};

export const Updates: Story = {
  beforeEach: () => seedPendingProposals(RECORD_UPDATES),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Update 2 People')).toBeVisible();
    await expect(await canvas.findAllByText('Head of Sales')).toHaveLength(2);
    await expect(
      canvas.getByRole('button', { name: 'Update 2' }),
    ).toBeEnabled();
  },
};

export const Deletions: Story = {
  beforeEach: () => seedPendingProposals(RECORD_DELETIONS),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Delete 2 People')).toBeVisible();
    await expect(
      await canvas.findByText(FIRST_PERSON.name.firstName, { exact: false }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Delete 2' }),
    ).toBeEnabled();
  },
};

export const UpdateClearingField: Story = {
  beforeEach: () =>
    seedPendingProposals([
      {
        ...RECORD_UPDATES[0],
        arguments: { id: FIRST_PERSON.id, city: null },
      },
      {
        ...RECORD_UPDATES[1],
        arguments: { id: SECOND_PERSON.id, jobTitle: 'Manager' },
      },
    ]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Manager')).toBeVisible();
    await expect(canvas.getAllByText('Empty')).toHaveLength(1);
    await expect(await canvas.findByText(FIRST_PERSON.city)).toBeVisible();
  },
};
