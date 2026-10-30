import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { type SetuAiTaskProjection } from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatTaskStatusCard } from '@/ai/components/AiChatTaskStatusCard';
import { aiTaskStateFamilyState } from '@/ai/states/aiTaskStateFamilyState';
import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

// Mock data for development stories only: these projections never come from
// a server, and the story mounts no poller, so no control here can execute.
const MOCK_BRIEF = {
  summary:
    'Acme is expanding its sales team and asked to revisit the project in November.',
  sections: [
    {
      heading: 'Overview',
      body: 'Mid-market logistics software company. Two open opportunities.',
      evidenceIds: ['record:company:mock-acme'],
    },
    {
      heading: 'Recent signals',
      body: '- Hiring three account executives\n- New warehouse product announced',
      evidenceIds: ['https://acme.example/news'],
    },
  ],
  unknowns: ['Who owns the budget this quarter'],
  suggestedNextSteps: ['Ask whether the November timing still holds'],
  evidence: [
    {
      id: 'record:company:mock-acme',
      kind: 'record' as const,
      label: 'Acme',
      objectNameSingular: 'company',
      recordId: 'mock-acme',
    },
    {
      id: 'https://acme.example/news',
      kind: 'web' as const,
      label: 'Acme newsroom',
      url: 'https://acme.example/news',
    },
  ],
  scope: 'crm_and_web' as const,
  removedEvidenceCount: 0,
  savedNoteId: 'mock-note',
};

const MOCK_STEP = {
  stepKey: 'company:mock',
  stateVersion: 3,
  errorCode: null,
  allowedOperations: [],
  pendingInput: null,
};

const MOCK_TASK: SetuAiTaskProjection = {
  schemaVersion: 1,
  id: 'mock-task',
  kind: 'account_research',
  status: 'waiting_input',
  stateVersion: 4,
  focus: null,
  saveBriefsAsNotes: true,
  allowedOperations: ['cancel'],
  errorCode: null,
  usage: { totalTokens: 48_000, tokenLimit: 600_000 },
  steps: [
    {
      ...MOCK_STEP,
      id: 'mock-step-acme',
      position: 0,
      companyId: 'mock-acme',
      companyName: 'Acme',
      status: 'completed',
      brief: MOCK_BRIEF,
      completedAt: '2026-10-30T10:41:00.000Z',
    },
    {
      ...MOCK_STEP,
      id: 'mock-step-northstar',
      position: 1,
      companyId: 'mock-northstar',
      companyName: 'Northstar',
      status: 'completed',
      brief: { ...MOCK_BRIEF, savedNoteId: 'mock-note-2' },
      completedAt: '2026-10-30T10:43:00.000Z',
    },
    {
      ...MOCK_STEP,
      id: 'mock-step-orbit',
      position: 2,
      companyId: 'mock-orbit',
      companyName: 'Orbit',
      status: 'waiting_input',
      allowedOperations: ['answer'],
      brief: null,
      completedAt: null,
      pendingInput: {
        version: 1,
        prompt:
          'Two companies match the name. Confirm the website to continue.',
        fields: [
          {
            name: 'answer',
            label: 'Website',
            type: FieldMetadataType.TEXT,
            placeholder: 'orbit.example',
            settings: { required: true },
          },
        ],
      },
    },
  ],
  createdAt: '2026-10-30T10:40:00.000Z',
  updatedAt: '2026-10-30T10:43:00.000Z',
};

const StyledContainer = styled.div`
  max-width: 560px;
  padding: 24px;
`;

const StateSeeder = ({
  entry,
  children,
}: {
  entry: AiTaskStateEntry;
  children: ReactNode;
}) => {
  const store = useStore();

  useEffect(() => {
    store.set(aiTaskStateFamilyState.atomFamily('story-task'), entry);
  }, [store, entry]);

  return <>{children}</>;
};

type StoryArgs = { entry: AiTaskStateEntry };

const meta: Meta<StoryArgs> = {
  title: 'Modules/AiChat/AiChatTaskStatusCard',
  render: ({ entry }) => (
    <StateSeeder entry={entry}>
      <StyledContainer>
        <AiChatTaskStatusCard taskId="story-task" />
      </StyledContainer>
    </StateSeeder>
  ),
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const WaitingForClarification: Story = {
  args: { entry: { status: 'available', task: MOCK_TASK } },
};

export const Running: Story = {
  args: {
    entry: {
      status: 'available',
      task: {
        ...MOCK_TASK,
        status: 'running',
        steps: [
          MOCK_TASK.steps[0],
          {
            ...MOCK_TASK.steps[1],
            status: 'running',
            brief: null,
            completedAt: null,
          },
          {
            ...MOCK_TASK.steps[2],
            status: 'queued',
            allowedOperations: [],
            pendingInput: null,
          },
        ],
      },
    },
  },
};

export const PartiallyCompleted: Story = {
  args: {
    entry: {
      status: 'available',
      task: {
        ...MOCK_TASK,
        status: 'partially_completed',
        allowedOperations: [],
        steps: [
          MOCK_TASK.steps[0],
          MOCK_TASK.steps[1],
          {
            ...MOCK_TASK.steps[2],
            status: 'failed',
            errorCode: 'TIMED_OUT',
            allowedOperations: ['retry'],
            pendingInput: null,
          },
        ],
      },
    },
  },
};

export const Completed: Story = {
  args: {
    entry: {
      status: 'available',
      task: {
        ...MOCK_TASK,
        status: 'completed',
        allowedOperations: [],
        steps: MOCK_TASK.steps.slice(0, 2),
      },
    },
  },
};

export const NewerSchemaFallback: Story = {
  args: { entry: { status: 'unsupported-version' } },
};
