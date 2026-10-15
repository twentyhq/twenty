import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
  FRONT_COMPONENT_TRANSLATIONS_KEY,
} from 'twenty-sdk/front-component-renderer';

import { setFrontComponentExecutionContext } from '../setFrontComponentExecutionContext';

const context: FrontComponentExecutionContext = {
  frontComponentId: 'component',
  userId: null,
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
  locale: 'fr-FR',
};
const scope = globalThis as Record<string, unknown>;

afterEach(() => {
  for (const key of [
    FRONT_COMPONENT_CONTEXT_KEY,
    FRONT_COMPONENT_LISTENERS_KEY,
    FRONT_COMPONENT_TRANSLATIONS_KEY,
  ]) {
    Reflect.deleteProperty(scope, key);
  }
});

it('seeds catalogs before notifying mounted component listeners and clears removed messages', () => {
  const listener = jest.fn(() => scope[FRONT_COMPONENT_TRANSLATIONS_KEY]);
  scope[FRONT_COMPONENT_LISTENERS_KEY] = new Set([listener]);
  setFrontComponentExecutionContext({
    ...context,
    translationCatalog: { label: 'Initial' },
  });
  expect(listener).toHaveLastReturnedWith({ 'fr-FR': { label: 'Initial' } });
  setFrontComponentExecutionContext({
    ...context,
    translationCatalog: { label: 'Updated' },
  });
  expect(listener).toHaveLastReturnedWith({ 'fr-FR': { label: 'Updated' } });
  setFrontComponentExecutionContext({ ...context, translationCatalog: {} });
  expect(listener).toHaveLastReturnedWith({ 'fr-FR': {} });
});

it('keeps a catalog embedded by an older bundle after runtime context updates', () => {
  setFrontComponentExecutionContext({
    ...context,
    translationCatalog: { label: 'Runtime' },
  });
  const embedded = { 'fr-FR': { label: 'Embedded' } };
  scope[FRONT_COMPONENT_TRANSLATIONS_KEY] = embedded;
  setFrontComponentExecutionContext({
    ...context,
    translationCatalog: { label: 'Changed runtime' },
  });
  expect(scope[FRONT_COMPONENT_TRANSLATIONS_KEY]).toBe(embedded);
});
