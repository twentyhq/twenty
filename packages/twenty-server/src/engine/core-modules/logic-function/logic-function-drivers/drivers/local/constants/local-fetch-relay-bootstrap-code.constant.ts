// Runs in the handler process before its code loads; the server performs each request under its outbound HTTP rules.
export const LOCAL_FETCH_RELAY_BOOTSTRAP_CODE = `
const pendingRelayedFetches = new Map();
let nextRelayedFetchId = 0;

const settleRelayedFetch = (message) => {
  const pending = pendingRelayedFetches.get(message.id);
  if (!pending) {
    return;
  }
  pendingRelayedFetches.delete(message.id);
  pending.cleanup();
  if (message.error !== undefined) {
    pending.reject(new TypeError('fetch failed', { cause: new Error(message.error) }));
    return;
  }
  pending.resolve(message.response);
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
      process.send({ type: 'fetchAbort', id });
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
