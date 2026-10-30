import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type SetuAiTaskProjection } from 'twenty-shared/ai';

import { AiChatTaskStatusCard } from '@/ai/components/AiChatTaskStatusCard';
import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';

const answer = jest.fn();
const retry = jest.fn();
const cancel = jest.fn();
let state: AiTaskStateEntry = { status: 'loading' };

jest.mock('@/ai/hooks/useAiTaskState', () => ({
  useAiTaskState: () => state,
}));
jest.mock('@/ai/hooks/useAiTaskOperations', () => ({
  useAiTaskOperations: () => ({ answer, retry, cancel }),
}));
jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownContent: ({ text }: { text: string }) => <p>{text}</p>,
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields',
  () => ({
    WorkflowFormFields: ({
      fields,
      onChange,
    }: {
      fields: { name: string; label: string }[];
      onChange: (fieldName: string, value: unknown) => void;
    }) => (
      <>
        {fields.map((field) => (
          <input
            key={field.name}
            aria-label={field.label}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        ))}
      </>
    ),
  }),
);

const BRIEF = {
  summary: '6sense sells account-based marketing software.',
  sections: [
    {
      heading: 'Overview',
      body: 'Revenue AI platform.',
      evidenceIds: ['record:company:six-id', 'https://6sense.com/about'],
    },
  ],
  unknowns: ['Current budget owner'],
  suggestedNextSteps: ['Ask about renewal timing'],
  evidence: [
    {
      id: 'record:company:six-id',
      kind: 'record' as const,
      label: '6sense',
      objectNameSingular: 'company',
      recordId: 'six-id',
    },
    {
      id: 'https://6sense.com/about',
      kind: 'web' as const,
      label: 'About 6sense',
      url: 'https://6sense.com/about',
    },
  ],
  scope: 'crm_and_web' as const,
  removedEvidenceCount: 1,
  savedNoteId: 'note-id',
};

const step = (
  overrides: Partial<SetuAiTaskProjection['steps'][number]>,
): SetuAiTaskProjection['steps'][number] => ({
  id: 'step-id',
  stepKey: 'company:six-id',
  position: 0,
  companyId: 'six-id',
  companyName: '6sense',
  status: 'completed',
  stateVersion: 3,
  errorCode: null,
  allowedOperations: [],
  pendingInput: null,
  brief: BRIEF,
  completedAt: '2026-10-30T10:41:00.000Z',
  ...overrides,
});

const TASK: SetuAiTaskProjection = {
  schemaVersion: 1,
  id: 'task-id',
  kind: 'account_research',
  status: 'waiting_input',
  stateVersion: 4,
  focus: null,
  saveBriefsAsNotes: true,
  allowedOperations: ['cancel'],
  errorCode: null,
  usage: { totalTokens: 1000, tokenLimit: 600000 },
  steps: [
    step({}),
    step({
      id: 'active-id',
      position: 1,
      companyName: 'ActiveCampaign',
      brief: { ...BRIEF, savedNoteId: 'note-2' },
    }),
    step({
      id: 'orbit-id',
      position: 2,
      companyId: 'orbit-company',
      companyName: 'Orbit',
      status: 'waiting_input',
      allowedOperations: ['answer'],
      brief: null,
      completedAt: null,
      pendingInput: {
        version: 1,
        prompt: 'Two companies match the name. Which website?',
        fields: [
          {
            name: 'answer',
            label: 'Website',
            type: 'TEXT' as never,
            settings: { required: true },
          },
        ],
      },
    }),
  ],
  createdAt: '2026-10-30T10:40:00.000Z',
  updatedAt: '2026-10-30T10:43:00.000Z',
};

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <MemoryRouter>
          <AiChatTaskStatusCard taskId="task-id" />
        </MemoryRouter>
      </Provider>
    </I18nProvider>,
  );

describe('AiChatTaskStatusCard', () => {
  beforeEach(() => {
    answer.mockReset();
    retry.mockReset();
    cancel.mockReset();
  });

  it('keeps finished briefs visible while one account waits for an answer', () => {
    state = { status: 'available', task: TASK };

    renderCard();

    expect(screen.getByText('2 of 3 ready')).toBeInTheDocument();
    expect(screen.getAllByText('Brief saved as a company note')).toHaveLength(
      2,
    );
    expect(screen.getByText('Needs your answer')).toBeInTheDocument();
    expect(
      screen.getByText('One account needs your answer before it can continue.'),
    ).toBeInTheDocument();
  });

  it('refuses an empty answer, then sends the answer for that exact step', async () => {
    const user = userEvent.setup();
    state = { status: 'available', task: TASK };
    answer.mockResolvedValue({ isSuccessful: true });

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Continue research' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Website is required');
    expect(answer).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Website'), 'orbit.example');
    await user.click(screen.getByRole('button', { name: 'Continue research' }));

    await waitFor(() =>
      expect(answer).toHaveBeenCalledWith(TASK.steps[2], {
        answer: 'orbit.example',
      }),
    );
  });

  it('opens a brief with its retrieved sources and scope', async () => {
    const user = userEvent.setup();
    state = { status: 'available', task: TASK };

    renderCard();

    await user.click(screen.getAllByRole('button', { name: 'Show brief' })[0]);

    expect(
      screen.getByText('6sense sells account-based marketing software.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About 6sense' })).toHaveAttribute(
      'href',
      'https://6sense.com/about',
    );
    expect(screen.getByText(/1 unsupported reference/)).toBeInTheDocument();
  });

  it('shows an error and keeps the card when stopping fails', async () => {
    const user = userEvent.setup();
    state = { status: 'available', task: TASK };
    cancel.mockResolvedValue({
      isSuccessful: false,
      errorCode: 'STALE_VERSION',
    });

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Stop task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This task changed since you opened it.',
    );
  });

  it('offers no controls once the task has finished', () => {
    state = {
      status: 'available',
      task: {
        ...TASK,
        status: 'completed',
        allowedOperations: [],
        steps: TASK.steps.slice(0, 2),
      },
    };

    renderCard();

    expect(
      screen.queryByRole('button', { name: 'Stop task' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue research' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows a refresh prompt for a newer task format', () => {
    state = { status: 'unsupported-version' };

    renderCard();

    expect(
      screen.getByText('This result requires a newer version of the app.'),
    ).toBeInTheDocument();
  });
});
