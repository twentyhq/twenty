import { LOCAL_FETCH_RELAY_MAX_CONCURRENT_REQUESTS } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';

// Runs in the handler process before its code loads; requests over the server's concurrency cap wait here, in the handler's memory.
export const LOCAL_FETCH_RELAY_BOOTSTRAP_CODE = `
const pendingRelayedFetches = new Map();
let nextRelayedFetchId = 0;

const relaySlotHolders = new Set();
const relaySlotWaiters = [];
let usedRelaySlots = 0;

const acquireRelaySlot = (signal) => {
  if (usedRelaySlots < ${LOCAL_FETCH_RELAY_MAX_CONCURRENT_REQUESTS}) {
    usedRelaySlots++;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const waiter = {};
    waiter.onAbort = () => {
      relaySlotWaiters.splice(relaySlotWaiters.indexOf(waiter), 1);
      reject(signal.reason);
    };
    waiter.grant = () => {
      signal.removeEventListener('abort', waiter.onAbort);
      resolve();
    };
    signal.addEventListener('abort', waiter.onAbort, { once: true });
    relaySlotWaiters.push(waiter);
  });
};

const releaseRelaySlot = () => {
  const nextWaiter = relaySlotWaiters.shift();
  if (nextWaiter) {
    nextWaiter.grant();
    return;
  }
  usedRelaySlots--;
};

const settleRelayedFetch = (message) => {
  if (relaySlotHolders.delete(message.id)) {
    releaseRelaySlot();
  }
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
  await acquireRelaySlot(request.signal);
  const id = nextRelayedFetchId++;
  relaySlotHolders.add(id);

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
