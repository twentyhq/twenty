import { isDefined } from 'twenty-shared/utils';

import { createFrontComponentSandboxIframe } from '@/remote/sandbox/utils/createFrontComponentSandboxIframe';

type FrontComponentSandboxIsolationReport = {
  iframeOrigin: string;
  workerOrigin: string;
  localStorageDenied: boolean;
  cookiesDenied: boolean;
  indexedDbDenied: boolean;
  workerIndexedDbDenied: boolean;
};

const SANDBOX_ISOLATION_PROBE_REPORT_MESSAGE_TYPE =
  'front-component-sandbox-isolation-report';

const SANDBOX_ISOLATION_PROBE_TIMEOUT_MS = 15000;

const SANDBOX_ISOLATION_PROBE_DATABASE_NAME =
  'front-component-sandbox-isolation-probe';

type WorkerProbeReport = {
  workerOrigin: string;
  workerIndexedDbDenied: boolean;
};

const runWorkerProbe = (databaseName: string): void => {
  const report = { workerOrigin: self.origin, workerIndexedDbDenied: false };

  try {
    indexedDB.open(databaseName);
  } catch {
    report.workerIndexedDbDenied = true;
  }

  self.postMessage(report);
};

const runSandboxProbe = (
  workerProbeSource: string,
  reportMessageType: string,
  databaseName: string,
): void => {
  const report = {
    iframeOrigin: self.origin,
    workerOrigin: '',
    localStorageDenied: false,
    cookiesDenied: false,
    indexedDbDenied: false,
    workerIndexedDbDenied: false,
  };

  try {
    window.localStorage.getItem('probe');
  } catch {
    report.localStorageDenied = true;
  }

  try {
    report.cookiesDenied = document.cookie === '';
  } catch {
    report.cookiesDenied = true;
  }

  try {
    indexedDB.open(databaseName);
  } catch {
    report.indexedDbDenied = true;
  }

  const workerUrl = URL.createObjectURL(
    new Blob([workerProbeSource], { type: 'application/javascript' }),
  );
  const worker = new Worker(workerUrl);

  worker.onmessage = (event: MessageEvent<WorkerProbeReport>) => {
    report.workerOrigin = event.data.workerOrigin;
    report.workerIndexedDbDenied = event.data.workerIndexedDbDenied;
    parent.postMessage({ type: reportMessageType, report }, '*');
  };
};

const serializeProbeInvocation = (
  probeFunction: (...probeArguments: string[]) => void,
  ...probeArguments: string[]
): string => {
  const serializedArguments = probeArguments
    .map((probeArgument) => JSON.stringify(probeArgument))
    .join(', ');

  return `(${probeFunction.toString()})(${serializedArguments});`;
};

const buildSandboxProbeDocument = (): string => {
  const workerProbeSource = serializeProbeInvocation(
    runWorkerProbe,
    SANDBOX_ISOLATION_PROBE_DATABASE_NAME,
  );

  const sandboxProbeScript = serializeProbeInvocation(
    runSandboxProbe,
    workerProbeSource,
    SANDBOX_ISOLATION_PROBE_REPORT_MESSAGE_TYPE,
    SANDBOX_ISOLATION_PROBE_DATABASE_NAME,
  );

  return `<!doctype html><html><body><script>${sandboxProbeScript}</script></body></html>`;
};

export const runFrontComponentSandboxIsolationProbe =
  (): Promise<FrontComponentSandboxIsolationReport> => {
    const sandboxIframe = createFrontComponentSandboxIframe(
      buildSandboxProbeDocument(),
    );

    return new Promise<FrontComponentSandboxIsolationReport>(
      (resolve, reject) => {
        const abortController = new AbortController();

        const removeSandbox = () => {
          abortController.abort();
          sandboxIframe.remove();
        };

        const timeoutId = setTimeout(() => {
          removeSandbox();
          reject(
            new Error('Front component sandbox isolation probe timed out'),
          );
        }, SANDBOX_ISOLATION_PROBE_TIMEOUT_MS);

        window.addEventListener(
          'message',
          (event: MessageEvent) => {
            if (event.source !== sandboxIframe.contentWindow) {
              return;
            }

            const data = event.data as {
              type?: string;
              report?: FrontComponentSandboxIsolationReport;
            } | null;

            if (
              data?.type !== SANDBOX_ISOLATION_PROBE_REPORT_MESSAGE_TYPE ||
              !isDefined(data.report)
            ) {
              return;
            }

            clearTimeout(timeoutId);
            removeSandbox();
            resolve(data.report);
          },
          { signal: abortController.signal },
        );

        document.body.append(sandboxIframe);
      },
    );
  };
