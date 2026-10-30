import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { type SetuAiActionProjection } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatActionReviewCard } from '@/ai/components/AiChatActionReviewCard';
import { aiActionStateFamilyState } from '@/ai/states/aiActionStateFamilyState';
import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

// Mock data for development stories only: these projections never come from
// a server, and the story mounts no poller, so no control here can execute.
const MOCK_EMAIL_ACTION: SetuAiActionProjection = {
  schemaVersion: 1,
  id: 'mock-email-action',
  logicalActionId: 'mock-logical-action',
  revision: 1,
  stateVersion: 1,
  status: 'pending_review',
  allowedOperations: ['revise', 'approve', 'reject'],
  expiresAt: null,
  errorCode: null,
  receipt: null,
  createdAt: '2026-10-30T09:00:00.000Z',
  updatedAt: '2026-10-30T09:00:00.000Z',
  kind: 'send_email',
  payload: {
    connectedAccountId: 'mock-account',
    senderHandle: 'riya@example.com',
    to: ['priya@example.com'],
    cc: [],
    bcc: [],
    subject: 'Restarting the expansion',
    body: 'Hi Priya,\n\nYou mentioned revisiting the expansion in November. Would a 20-minute call next week be useful to discuss timing and next steps?\n\nBest,\nRiya',
  },
};

const MOCK_RECORD_ACTION: SetuAiActionProjection = {
  ...MOCK_EMAIL_ACTION,
  id: 'mock-record-action',
  kind: 'update_record_fields',
  payload: {
    objectNameSingular: 'opportunity',
    objectLabel: 'Opportunity',
    recordId: 'mock-record',
    recordLabel: 'Acme expansion',
    changes: [
      {
        fieldName: 'stage',
        fieldLabel: 'Stage',
        before: 'MEETING',
        after: 'PROPOSAL',
      },
      {
        fieldName: 'probability',
        fieldLabel: 'Close probability',
        before: 40,
        after: 60,
      },
    ],
  },
};

const StyledContainer = styled.div`
  max-width: 560px;
  padding: 24px;
`;

const StateSeeder = ({
  entry,
  children,
}: {
  entry: AiActionStateEntry;
  children: ReactNode;
}) => {
  const store = useStore();

  useEffect(() => {
    store.set(aiActionStateFamilyState.atomFamily('story-action'), entry);
  }, [store, entry]);

  return <>{children}</>;
};

type StoryArgs = { entry: AiActionStateEntry };

const meta: Meta<StoryArgs> = {
  title: 'Modules/AiChat/AiChatActionReviewCard',
  render: ({ entry }) => (
    <StateSeeder entry={entry}>
      <StyledContainer>
        <AiChatActionReviewCard actionRequestId="story-action" />
      </StyledContainer>
    </StateSeeder>
  ),
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const EmailReview: Story = {
  args: { entry: { status: 'available', action: MOCK_EMAIL_ACTION } },
};

export const RecordChangeReview: Story = {
  args: { entry: { status: 'available', action: MOCK_RECORD_ACTION } },
};

export const Queued: Story = {
  args: {
    entry: {
      status: 'available',
      action: {
        ...MOCK_EMAIL_ACTION,
        revision: 2,
        status: 'queued',
        allowedOperations: ['revise', 'cancel'],
      },
    },
  },
};

export const AcceptedByProvider: Story = {
  args: {
    entry: {
      status: 'available',
      action: {
        ...MOCK_EMAIL_ACTION,
        status: 'succeeded',
        allowedOperations: [],
        receipt: {
          completedAt: '2026-10-30T09:05:00.000Z',
          summary:
            'Accepted by the email provider for priya@example.com. This confirms sending, not delivery or a reply.',
        },
      },
    },
  },
};

export const OutcomeUnknown: Story = {
  args: {
    entry: {
      status: 'available',
      action: {
        ...MOCK_EMAIL_ACTION,
        status: 'delivery_unknown',
        allowedOperations: [],
      },
    },
  },
};

export const BlockedBySourceChange: Story = {
  args: {
    entry: {
      status: 'available',
      action: {
        ...MOCK_RECORD_ACTION,
        status: 'blocked',
        errorCode: 'SOURCE_CHANGED',
        allowedOperations: [],
      },
    },
  },
};

export const NewerSchemaFallback: Story = {
  args: { entry: { status: 'unsupported-version' } },
};
