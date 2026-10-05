import { type RemoteConnection } from '@remote-dom/core/elements';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

import { getFrontComponentExecutionContext } from '@/remote/worker/environment/utils/getFrontComponentExecutionContext';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';
import { loadFrontComponentModule } from '@/remote/worker/module-loading/utils/loadFrontComponentModule';
import { renderFrontComponent } from '../renderFrontComponent';

jest.mock(
  '@/remote/worker/rendering/utils/attachRemoteRenderRootToWorkerDocument',
  () => ({
    attachRemoteRenderRootToWorkerDocument: jest.fn(() => ({})),
  }),
);

jest.mock('@/remote/worker/fetch-proxy/utils/installHostFetchProxy', () => ({
  installHostFetchProxy: jest.fn(),
}));

jest.mock(
  '@/remote/worker/module-loading/utils/loadFrontComponentModule',
  () => ({
    loadFrontComponentModule: jest.fn(),
  }),
);

const COMPONENT_RENDER_CONTEXT = {
  componentUrl: 'https://api.twenty.test/rest/front-components/id',
  componentSource: 'export default () => {};',
};

const createExecutionContext = (
  overrides: Partial<FrontComponentExecutionContext> = {},
): FrontComponentExecutionContext => ({
  frontComponentId: 'front-component-id',
  userId: null,
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
  ...overrides,
});

const readExecutionContextWhenModuleLoads = async (
  initialExecutionContext: FrontComponentExecutionContext,
) => {
  let executionContextWhenModuleLoads:
    | FrontComponentExecutionContext
    | undefined;

  jest.mocked(loadFrontComponentModule).mockImplementation(async () => {
    executionContextWhenModuleLoads = getFrontComponentExecutionContext();

    return { default: jest.fn() };
  });

  await renderFrontComponent({
    connection: {} as RemoteConnection,
    renderContext: { ...COMPONENT_RENDER_CONTEXT, initialExecutionContext },
    hostFetch: jest.fn(),
  });

  return executionContextWhenModuleLoads;
};

describe('renderFrontComponent', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
  });

  it('should fail closed when the host fetch bridge is unavailable', async () => {
    await expect(
      renderFrontComponent({
        connection: {} as RemoteConnection,
        renderContext: COMPONENT_RENDER_CONTEXT,
        hostFetch: null,
      }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_HOST_FETCH_UNAVAILABLE',
    });
  });

  it('should seed the initial execution context before the component module loads', async () => {
    const initialExecutionContext = createExecutionContext({
      colorScheme: 'dark',
    });

    expect(
      await readExecutionContextWhenModuleLoads(initialExecutionContext),
    ).toBe(initialExecutionContext);
  });

  it('should keep a context the host pushed before render when the module loads', async () => {
    const pushedExecutionContext = createExecutionContext({
      colorScheme: 'dark',
    });

    setFrontComponentExecutionContext(pushedExecutionContext);

    expect(
      await readExecutionContextWhenModuleLoads(
        createExecutionContext({ colorScheme: 'light' }),
      ),
    ).toBe(pushedExecutionContext);
  });
});
