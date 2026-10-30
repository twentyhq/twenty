import { t } from '@lingui/core/macro';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { fetchComponentSource } from 'twenty-front-component-renderer';
import { CustomError, isDefined } from 'twenty-shared/utils';
import {
  FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
  readFrontComponentSharedDependenciesChecksum,
} from 'twenty-shared/application';

export const loadAiWorkspaceFrontComponentRuntimeOrThrow = async ({
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
    throw new CustomError(
      t`Could not load this component or its data.`,
      'AI_FRONT_COMPONENT_RUNTIME_LOAD_FAILED',
    );
  }

  const runtime: Omit<
    AiWorkspaceFrontComponentRuntime,
    'componentSource' | 'sharedDependenciesSource'
  > & { builtComponentChecksum: string } = await response.json();
  const componentSource = await fetchComponentSource({
    url: getFingerprintedRestUrl({
      resource: 'front-components',
      id: frontComponentId,
      checksum: runtime.builtComponentChecksum,
    }),
    headers,
  });

  if (
    !componentSource.includes(
      FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
    )
  ) {
    return { ...runtime, componentSource };
  }

  const sharedDependenciesChecksum =
    readFrontComponentSharedDependenciesChecksum(componentSource) ??
    runtime.sharedDependenciesChecksum;

  if (!isDefined(sharedDependenciesChecksum)) {
    throw new CustomError(
      t`Component shared dependencies are missing.`,
      'AI_FRONT_COMPONENT_SHARED_DEPENDENCIES_MISSING',
    );
  }

  const sharedDependenciesSource = await fetchComponentSource({
    url: getFingerprintedRestUrl({
      resource: 'front-component-shared-dependencies/bundles',
      id: runtime.applicationId,
      checksum: sharedDependenciesChecksum,
    }),
    headers,
  });

  return {
    ...runtime,
    componentSource,
    sharedDependenciesChecksum,
    sharedDependenciesSource,
  };
};
