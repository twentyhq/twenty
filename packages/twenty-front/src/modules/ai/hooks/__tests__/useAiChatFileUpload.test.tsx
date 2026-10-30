import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MetadataAndApolloMocksWrapper>
    <I18nProvider i18n={i18n}>
      {children}
      <AppToaster />
    </I18nProvider>
  </MetadataAndApolloMocksWrapper>
);

describe('useAiChatFileUpload', () => {
  it('aborts the upload of a file removed from the selection', async () => {
    const { result } = renderHook(() => useAiChatFileUpload(), {
      wrapper: Wrapper,
    });
    const file = new File(['brief'], 'brief.pdf');

    let upload: Promise<void> = Promise.resolve();

    act(() => {
      upload = result.current.uploadFiles([file]);
    });

    await waitFor(() => expect(putFile).toHaveBeenCalled());

    await act(async () => {
      jotaiStore.set(agentChatSelectedFilesState.atom, []);
      await upload;
    });

    expect(putFile.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
