import { TextDecoder, TextEncoder } from 'node:util';
import { deserialize, serialize } from 'node:v8';

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => deserialize(serialize(value));
}

// jsdom has no TextEncoder/TextDecoder, and react-router (reached through
// twenty-shared/utils) references them while being imported.
if (globalThis.TextEncoder === undefined) {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}
