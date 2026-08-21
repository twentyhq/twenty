import { TextDecoder, TextEncoder } from 'node:util';

class StubMessagePort {
  onmessage: unknown = null;
  postMessage(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  start(): void {}
  close(): void {}
}

class StubMessageChannel {
  port1 = new StubMessagePort();
  port2 = new StubMessagePort();
}

const mutableGlobal = globalThis as unknown as Record<string, unknown>;

if (typeof mutableGlobal.MessageChannel === 'undefined') {
  mutableGlobal.MessageChannel = StubMessageChannel;
}

if (typeof mutableGlobal.TextEncoder === 'undefined') {
  mutableGlobal.TextEncoder = TextEncoder;
}

if (typeof mutableGlobal.TextDecoder === 'undefined') {
  mutableGlobal.TextDecoder = TextDecoder;
}
