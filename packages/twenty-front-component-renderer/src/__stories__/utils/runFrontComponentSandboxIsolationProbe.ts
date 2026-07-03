import { isDefined } from 'twenty-shared/utils';

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

const WORKER_PROBE_SOURCE = [
  'const report = { workerOrigin: self.origin };',
  'try {',
  `  indexedDB.open(${JSON.stringify(SANDBOX_ISOLATION_PROBE_DATABASE_NAME)});`,
  '  report.workerIndexedDbDenied = false;',
  '} catch {',
  '  report.workerIndexedDbDenied = true;',
  '}',
  'self.postMessage(report);',
].join('\n');

const buildSandboxProbeDocument = (): string =>
  [
    '<!doctype html><html><body><script>',
    '(function () {',
    '  const report = { iframeOrigin: self.origin };',
    '  try { window.localStorage.getItem("probe"); report.localStorageDenied = false; }',
    '  catch { report.localStorageDenied = true; }',
    '  try { report.cookiesDenied = document.cookie === ""; }',
    '  catch { report.cookiesDenied = true; }',
    `  try { indexedDB.open(${JSON.stringify(SANDBOX_ISOLATION_PROBE_DATABASE_NAME)}); report.indexedDbDenied = false; }`,
    '  catch { report.indexedDbDenied = true; }',
    `  const workerUrl = URL.createObjectURL(new Blob([${JSON.stringify(WORKER_PROBE_SOURCE)}], { type: "application/javascript" }));`,
    '  const worker = new Worker(workerUrl);',
    '  worker.onmessage = function (event) {',
    '    report.workerOrigin = event.data.workerOrigin;',
    '    report.workerIndexedDbDenied = event.data.workerIndexedDbDenied;',
    `    parent.postMessage({ type: ${JSON.stringify(SANDBOX_ISOLATION_PROBE_REPORT_MESSAGE_TYPE)}, report: report }, "*");`,
    '  };',
    '})();',
    '</script></body></html>',
  ].join('\n');

export const runFrontComponentSandboxIsolationProbe =
  (): Promise<FrontComponentSandboxIsolationReport> => {
    const sandboxIframe = document.createElement('iframe');
    sandboxIframe.setAttribute('sandbox', 'allow-scripts');
    sandboxIframe.style.display = 'none';
    sandboxIframe.srcdoc = buildSandboxProbeDocument();

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
