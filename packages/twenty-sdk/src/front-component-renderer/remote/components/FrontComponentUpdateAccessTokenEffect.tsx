import { type FrontComponentHostCommunicationApi } from '@/front-component-renderer/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/front-component-renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentUpdateAccessTokenEffectProps = {
  thread: ThreadWebWorker<WorkerExports, FrontComponentHostCommunicationApi>;
  applicationAccessToken: string;
};

export const FrontComponentUpdateAccessTokenEffect = ({
  thread,
  applicationAccessToken,
}: FrontComponentUpdateAccessTokenEffectProps) => {
  useEffect(() => {
    thread.imports.updateAccessToken(applicationAccessToken).catch((error) => {
      console.error(
        '[FrontComponentUpdateAccessTokenEffect] Failed to update access token:',
        error,
      );
    });
  }, [applicationAccessToken, thread]);

  return null;
};
