import { t } from '@lingui/core/macro';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';

export const loadAiWorkspaceFrontComponentRuntime = async ({
  frontComponentId,
  signal,
}: {
  frontComponentId: string;
  signal: AbortSignal;
}): Promise<AiWorkspaceFrontComponentRuntime> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/ai-front-components/${encodeURIComponent(frontComponentId)}/runtime`,
    { credentials: 'include', signal },
  );

  if (!response.ok) {
    throw new Error(t`Could not load this component or its data.`);
  }

  return response.json();
};
