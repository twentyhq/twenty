import { graphql, http, HttpResponse } from 'msw';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { PageLayoutType } from 'twenty-shared/types';

import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const COMPONENT_SOURCE = `export default function render(container) {
  const button = document.createElement('html-button');
  let count = 0;
  button.textContent = 'Count: 0';
  button.addEventListener('click', () => { button.textContent = 'Count: ' + ++count; });
  container.appendChild(button);
}`;

const RUNTIME_ERROR_SOURCE = `export default function render() {
  throw new Error('Component crashed.');
}`;

const RUNTIME_ERROR_SOURCES: Record<string, string> = {
  'runtime-error': RUNTIME_ERROR_SOURCE,
  'blank-runtime-error': `export default function render() { throw new Error('   '); }`,
  'long-runtime-error': `export default function render() { throw new Error('x'.repeat(2100)); }`,
  'report-failure': RUNTIME_ERROR_SOURCE,
};

export const frontComponentPreviewReports: unknown[] = [];

export const getFrontComponentPreviewMock = (draftId = 'current') => ({
  pageLayoutType:
    draftId === 'record-page'
      ? PageLayoutType.RECORD_PAGE
      : PageLayoutType.DASHBOARD,
  isCurrent: draftId !== 'superseded',
  publishedComponentId: draftId === 'saved' ? 'saved-component' : undefined,
  componentSource: RUNTIME_ERROR_SOURCES[draftId] ?? COMPONENT_SOURCE,
  applicationId: 'storybook-app',
  sharedDependenciesChecksum: 'storybook-checksum',
  mockQueryResult: {},
});

export const seedFrontComponentPreviewWorkspace = (isEnabled = true) => {
  frontComponentPreviewReports.length = 0;
  const previous = jotaiStore.get(currentWorkspaceState.atom);
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
        value: isEnabled,
      },
    ],
  });
  return () => jotaiStore.set(currentWorkspaceState.atom, previous);
};

export const frontComponentPreviewHandlers = [
  graphql.query('GetToolIndex', () =>
    HttpResponse.json({ data: { getToolIndex: [] } }),
  ),
  http.get(
    `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`,
    ({ params, request }) => {
      if (request.headers.get(SESSION_COOKIE_OPT_IN_HEADER_NAME) !== '1') {
        return new HttpResponse(null, { status: 401 });
      }
      if (params.draftId === 'unavailable') {
        return new HttpResponse(null, { status: 404 });
      }
      return HttpResponse.json(
        getFrontComponentPreviewMock(String(params.draftId)),
      );
    },
  ),
  http.get(
    `${REST_API_BASE_URL}/front-component-shared-dependencies/storybook-app/storybook-checksum.js`,
    ({ request }) =>
      request.headers.get(SESSION_COOKIE_OPT_IN_HEADER_NAME) === '1'
        ? new HttpResponse('export {};', {
            headers: { 'Content-Type': 'application/javascript' },
          })
        : new HttpResponse(null, { status: 401 }),
  ),
  http.post(
    `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId/preview-error`,
    async ({ params, request }) => {
      if (request.headers.get(SESSION_COOKIE_OPT_IN_HEADER_NAME) !== '1') {
        return new HttpResponse(null, { status: 401 });
      }
      frontComponentPreviewReports.push(await request.json());
      return new HttpResponse(null, {
        status: params.draftId === 'report-failure' ? 500 : 204,
      });
    },
  ),
];
