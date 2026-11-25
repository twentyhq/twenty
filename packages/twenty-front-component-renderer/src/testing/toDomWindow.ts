import { type Window as PolyfillWindow } from '@remote-dom/polyfill';

export const toDomWindow = (
  polyfillWindow: PolyfillWindow,
): Window & typeof globalThis =>
  // @ts-expect-error remote-dom's classes only implement part of their DOM counterparts
  polyfillWindow;
