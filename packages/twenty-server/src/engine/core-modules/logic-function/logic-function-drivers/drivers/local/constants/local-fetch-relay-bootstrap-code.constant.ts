// Runs in the handler process before its code loads. Requests leave through
// the server, which applies the outbound HTTP rules; bodies cross the IPC
// channel as base64.
export const LOCAL_FETCH_RELAY_BOOTSTRAP_CODE = `
const pendingRelayedFetches = new Map();
let nextRelayedFetchId = 0;

const settleRelayedFetch = (msg) => {
  const pending = pendingRelayedFetches.get(msg.id);
  if (!pending) return;
  pendingRelayedFetches.delete(msg.id);
  pending.cleanup();
  if (msg.error !== undefined) {
    pending.reject(new TypeError('fetch failed', { cause: new Error(msg.error) }));
    return;
  }
  pending.resolve(msg.response);
};

globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  request.signal.throwIfAborted();
  const body =
    request.body === null
      ? undefined
      : Buffer.from(await request.arrayBuffer()).toString('base64');
  const id = nextRelayedFetchId++;

  const response = await new Promise((resolve, reject) => {
    const onAbort = () => {
      pendingRelayedFetches.delete(id);
      reject(request.signal.reason);
    };
    request.signal.addEventListener('abort', onAbort, { once: true });
    pendingRelayedFetches.set(id, {
      resolve,
      reject,
      cleanup: () => request.signal.removeEventListener('abort', onAbort),
    });
    process.send({
      type: 'fetch',
      id,
      request: {
        url: request.url,
        method: request.method,
        headers: [...request.headers],
        body,
        redirect: request.redirect,
      },
    });
  });

  return new Response(
    response.body === undefined ? null : Buffer.from(response.body, 'base64'),
    {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    },
  );
};
`;
