import { getGettingStartedStepDoneCta } from '@/getting-started/utils/getGettingStartedStepDoneCta';
import {
  GettingStartedStepActionKey,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

const CHAT_THREAD_ID = '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90';

describe('getGettingStartedStepDoneCta', () => {
  it.each([
    {
      description: 'opens the workflow of a workflow step',
      stepDefinition: {
        kind: GettingStartedStepKind.WORKFLOW,
        actionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
        doneChatThreadId: null,
      },
      expected: {
        type: 'workflow',
        stepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      },
    },
    {
      description: 'continues the thread of a prompt step',
      stepDefinition: {
        kind: GettingStartedStepKind.PROMPT,
        actionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        doneChatThreadId: CHAT_THREAD_ID,
      },
      expected: { type: 'chatThread', chatThreadId: CHAT_THREAD_ID },
    },
    {
      description: 'continues the import thread',
      stepDefinition: {
        kind: GettingStartedStepKind.CUSTOM,
        actionKey: GettingStartedStepActionKey.IMPORT_DATA,
        doneChatThreadId: CHAT_THREAD_ID,
      },
      expected: { type: 'chatThread', chatThreadId: CHAT_THREAD_ID },
    },
    {
      description: 'invites more teammates',
      stepDefinition: {
        kind: GettingStartedStepKind.CUSTOM,
        actionKey: GettingStartedStepActionKey.INVITE_TEAM,
        doneChatThreadId: null,
      },
      expected: { type: 'invite' },
    },
    {
      description: 'has none for a chat step without a thread',
      stepDefinition: {
        kind: GettingStartedStepKind.PROMPT,
        actionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        doneChatThreadId: null,
      },
      expected: null,
    },
    {
      description: 'keeps the mailbox accounts table',
      stepDefinition: {
        kind: GettingStartedStepKind.CUSTOM,
        actionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
        doneChatThreadId: null,
      },
      expected: null,
    },
    {
      description: 'keeps the app list',
      stepDefinition: {
        kind: GettingStartedStepKind.CUSTOM,
        actionKey: GettingStartedStepActionKey.INSTALL_APP,
        doneChatThreadId: null,
      },
      expected: null,
    },
  ])('$description', ({ stepDefinition, expected }) => {
    expect(getGettingStartedStepDoneCta(stepDefinition)).toEqual(expected);
  });
});
