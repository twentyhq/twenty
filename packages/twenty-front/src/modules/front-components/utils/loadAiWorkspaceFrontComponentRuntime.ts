import { t } from '@lingui/core/macro';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { fetchComponentSource } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

export const loadAiWorkspaceFrontComponentRuntime = async ({
  frontComponentId,
  applicationAccessToken,
  signal,
}: {
  frontComponentId: string;
  applicationAccessToken: string;
  signal: AbortSignal;
}): Promise<AiWorkspaceFrontComponentRuntime> => {
  const headers = { Authorization: `Bearer ${applicationAccessToken}` };
  const response = await fetch(
    `${REST_API_BASE_URL}/ai-front-components/${encodeURIComponent(frontComponentId)}/runtime`,
    { headers, credentials: 'same-origin', signal },
  );

  if (!response.ok) {
    throw new Error(t`Could not load this component or its data.`);
  }

  const runtime: AiWorkspaceFrontComponentRuntime = await response.json();

  if (!isDefined(runtime.sharedDependenciesChecksum)) {
    return runtime;
  }

  const sharedDependenciesSource = await fetchComponentSource({
    url: getFingerprintedRestUrl({
      resource: 'front-component-shared-dependencies/bundles',
      id: runtime.applicationId,
      checksum: runtime.sharedDependenciesChecksum,
    }),
    headers,
  });

  return { ...runtime, sharedDependenciesSource };
};
