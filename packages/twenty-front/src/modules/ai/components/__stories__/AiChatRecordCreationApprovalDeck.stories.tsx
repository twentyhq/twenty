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
  title: 'Modules/AI/AiChatRecordCreationApprovalDeck',
  component: AiChatPendingAskGate,
  decorators: [
    RootDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  parameters: { container: { width: 600 } },
  args: { children: 'No pending requests' },
  beforeEach: () => {
    const previousThread = jotaiStore.get(agentChatDisplayedThreadState.atom);
    const messagesAtom = agentChatMessagesFamilyState.atomFamily({
      threadId: THREAD_ID,
    });
    const previousMessages = jotaiStore.get(messagesAtom);

    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(messagesAtom, [
      {
        id: 'pending-record-creations',
        role: 'assistant',
        parts: RECORD_CREATIONS.map(
          (proposal, index): ExtendedUIMessagePart => ({
            type: `tool-${PROPOSE_TOOL_CALL_TOOL_NAME}`,
            toolCallId: `record-creation-${index}`,
            state: 'output-available',
            input: {},
            output: { success: true, result: { status: 'pending', proposal } },
          }),
        ),
      },
    ]);

    return () => {
      jotaiStore.set(agentChatDisplayedThreadState.atom, previousThread);
      jotaiStore.set(messagesAtom, previousMessages);
    };
  },
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
