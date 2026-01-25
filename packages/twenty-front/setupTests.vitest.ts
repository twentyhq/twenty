import '@testing-library/jest-dom/vitest';

import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages as enMessages } from '~/locales/generated/en';

process.env.TZ = 'GMT';
process.env.LC_ALL = 'en_US.UTF-8';

// Initialize i18n for all tests
i18n.load({ [SOURCE_LOCALE]: enMessages });
i18n.activate(SOURCE_LOCALE);

/**
 * The structuredClone global function is not available in jsdom, it needs to be mocked for now.
 *
 * The most naive way to mock structuredClone is to use JSON.stringify and JSON.parse. This works
 * for arguments with simple types like primitives, arrays and objects, but doesn't work with functions,
 * Map, Set, etc.
 */
globalThis.structuredClone = (val: unknown) => {
  return JSON.parse(JSON.stringify(val)) as typeof val;
};
