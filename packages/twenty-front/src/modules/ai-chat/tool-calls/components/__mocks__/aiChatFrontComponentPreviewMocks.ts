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

const COMPANY_PREVIEW_SOURCE = `import { CoreApiClient } from 'twenty-client-sdk/core';
export default async function render(container) {
  const result = await new CoreApiClient().query({ companies: {
    edges: { node: { id: true, name: true, employees: true, idealCustomerProfile: true } },
    totalCount: true,
    pageInfo: { hasNextPage: true },
  } });
  const companies = result.companies.edges.map(({ node }) => node);
  const heading = document.createElement('html-h2');
  heading.textContent = 'Company size overview';
  const summary = document.createElement('html-p');
  const search = document.createElement('html-input');
  search.setAttribute('aria-label', 'Search companies');
  const sort = document.createElement('html-button');
  const list = document.createElement('html-ul');
  let filter = '';
  let sortByName = false;
  const update = () => {
    const visible = companies
      .filter(company => company.name.toLowerCase().includes(filter))
      .sort((left, right) => sortByName
        ? left.name.localeCompare(right.name)
        : right.employees - left.employees);
    summary.textContent = visible.length + ' companies listed, ' +
      visible.filter(company => company.idealCustomerProfile).length + ' ideal customer profiles';
    sort.textContent = sortByName ? 'Sort by size' : 'Sort by name';
    list.replaceChildren(...visible.map(company => {
      const item = document.createElement('html-li');
      item.textContent = company.name + ': ' + company.employees + ' employees';
      return item;
    }));
  };
  search.addEventListener('input', event => { filter = event.target.value.toLowerCase(); update(); });
  sort.addEventListener('click', () => { sortByName = !sortByName; update(); });
  container.append(heading, summary, search, sort, list);
  update();
}`;

const COMPANY_RECORDS = [
  { id: 'acme', name: 'Acme', employees: 50, idealCustomerProfile: true },
  { id: 'nova', name: 'Nova', employees: 220, idealCustomerProfile: false },
  { id: 'orbit', name: 'Orbit', employees: 10, idealCustomerProfile: true },
];

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
  componentSource:
    draftId === 'companies'
      ? COMPANY_PREVIEW_SOURCE
      : (RUNTIME_ERROR_SOURCES[draftId] ?? COMPONENT_SOURCE),
  applicationId: 'storybook-app',
  sharedDependenciesChecksum: 'storybook-checksum',
  mockQueryResult:
    draftId === 'companies'
      ? {
          companies: {
            edges: COMPANY_RECORDS.map((node) => ({ node })),
            totalCount: COMPANY_RECORDS.length,
            pageInfo: { hasNextPage: false },
          },
        }
      : {},
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
