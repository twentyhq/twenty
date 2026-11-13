import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { useInboxFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { inboxSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CreateFileUploadDocument } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const createFileUploadMock: MockedResponse = {
  request: { query: CreateFileUploadDocument, variables: () => true },
  result: {
    data: {
      createFileUpload: {
        fileId: '20202020-0000-4000-8000-0000000000f1',
        uploadUrl: 'https://storage.twenty.com/upload',
        contentType: 'application/pdf',
        expiresAt: '2026-10-14T00:15:00.000Z',
      },
    },
  },
};

const putFile = jest.fn(
  (_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', reject);
    }),
);

global.fetch = putFile;

const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [createFileUploadMock],
});

const DIRECT_MESSAGE_THREAD_ID = '20202020-0000-4000-8000-000000000001';
const NEW_THREAD_ID = '20202020-0000-4000-8000-000000000002';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MetadataAndApolloMocksWrapper>
    <I18nProvider i18n={i18n}>
      {children}
      <AppToaster />
    </I18nProvider>
  </MetadataAndApolloMocksWrapper>
);

describe('useInboxFileUpload', () => {
  it('uploads after leaving a DM and aborts files removed from the selection', async () => {
    const previousThreadId = jotaiStore.get(currentInboxThreadState.atom);
    const directMessageAtom = recordStoreFamilyState.atomFamily(
      DIRECT_MESSAGE_THREAD_ID,
    );
    const previousDirectMessage = jotaiStore.get(directMessageAtom);
    jotaiStore.set(directMessageAtom, {
      id: DIRECT_MESSAGE_THREAD_ID,
      __typename: 'AgentChatThread',
      conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
    });
    jotaiStore.set(currentInboxThreadState.atom, DIRECT_MESSAGE_THREAD_ID);
    const { result } = renderHook(() => useInboxFileUpload(), {
      wrapper: Wrapper,
    });
    const file = new File(['brief'], 'brief.pdf');

    let upload: ReturnType<typeof result.current.uploadFiles> = Promise.resolve(
      [],
    );

    try {
      act(() => {
        jotaiStore.set(currentInboxThreadState.atom, NEW_THREAD_ID);
        upload = result.current.uploadFiles([file]);
      });

      await waitFor(() => expect(putFile).toHaveBeenCalled());

      await act(async () => {
        jotaiStore.set(inboxSelectedFilesState.atom, []);
        await upload;
      });

      expect(putFile.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      jotaiStore.set(currentInboxThreadState.atom, previousThreadId);
      jotaiStore.set(directMessageAtom, previousDirectMessage);
    }
  });
});
