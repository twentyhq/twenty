// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Trans } from '../../components/Trans';
import { useTranslate } from '../useTranslate';
import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
  FRONT_COMPONENT_TRANSLATIONS_KEY,
} from 'twenty-sdk/front-component-renderer';

const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
) => {
  const scope = globalThis as Record<string, unknown>;
  scope[FRONT_COMPONENT_CONTEXT_KEY] = context;
  scope[FRONT_COMPONENT_TRANSLATIONS_KEY] = {
    [context.locale ?? 'en']: context.translationCatalog ?? {},
  };
  const listeners = scope[FRONT_COMPONENT_LISTENERS_KEY] as
    | Set<() => void>
    | undefined;
  listeners?.forEach((listener) => listener());
};

const context: FrontComponentExecutionContext = {
  frontComponentId: 'component',
  userId: null,
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
  locale: 'fr-FR',
};
const messageId = 'tfDRzk';
const Component = () => {
  const [count, setCount] = useState(0);
  const { t } = useTranslate();
  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        {t('Save')} {count}
      </button>
      <Trans message="Save" />
    </>
  );
};

afterEach(() => {
  cleanup();
  for (const key of [
    FRONT_COMPONENT_CONTEXT_KEY,
    FRONT_COMPONENT_LISTENERS_KEY,
    FRONT_COMPONENT_TRANSLATIONS_KEY,
  ]) {
    Reflect.deleteProperty(globalThis, key);
  }
});

it('updates translations in place, retains component state, and falls back after removal', async () => {
  setFrontComponentExecutionContext({
    ...context,
    translationCatalog: { [messageId]: 'Enregistrer' },
  });
  render(<Component />);
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Enregistrer 0' }));
  act(() =>
    setFrontComponentExecutionContext({
      ...context,
      translationCatalog: { [messageId]: 'Sauvegarder' },
    }),
  );
  expect(screen.getByRole('button', { name: 'Sauvegarder 1' })).toBeTruthy();
  expect(screen.getByText('Sauvegarder')).toBeTruthy();
  act(() =>
    setFrontComponentExecutionContext({ ...context, translationCatalog: {} }),
  );
  expect(screen.getByRole('button', { name: 'Save 1' })).toBeTruthy();
  expect(screen.getByText('Save')).toBeTruthy();
  act(() =>
    setFrontComponentExecutionContext({
      ...context,
      locale: 'de-DE',
      translationCatalog: { [messageId]: 'Speichern' },
    }),
  );
  expect(screen.getByRole('button', { name: 'Speichern 1' })).toBeTruthy();
});
