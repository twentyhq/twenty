import { act, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as React from 'react';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import type * as frontComponentSdk from 'twenty-sdk/front-component';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from 'twenty-sdk/front-component-renderer';
import { ModuleKind, transpileModule } from 'typescript';

import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';
const contextModule: { source: string } = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../twenty-server/src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-context-module.json',
    ),
    'utf8',
  ),
);

const moduleExports: Pick<
  typeof frontComponentSdk,
  'useSelectedRecordIds' | 'useSelectedObjectMetadata'
> = new Function(
  'require',
  'exports',
  `${
    transpileModule(contextModule.source, {
      compilerOptions: { module: ModuleKind.CommonJS },
    }).outputText
  }; return exports;`,
)(() => React, {});

const RecordWidget = () => {
  const recordId = moduleExports.useSelectedRecordIds()[0];
  const objectMetadata = moduleExports.useSelectedObjectMetadata();

  return (
    <p>
      {recordId
        ? `${objectMetadata?.nameSingular}: ${recordId}`
        : 'No record selected'}
    </p>
  );
};

const CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'component',
  userId: null,
  recordId: null,
  selectedRecordIds: ['first-record'],
  selectedObjectMetadata: {
    id: 'company-object',
    nameSingular: 'company',
    namePlural: 'companies',
  },
  timelineActivityId: null,
  colorScheme: 'light',
};

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY];
});

it('updates an AI-built widget when the renderer changes the viewed record or clears selection', () => {
  setFrontComponentExecutionContext(CONTEXT);
  const { unmount } = render(<RecordWidget />);

  expect(screen.getByText('company: first-record')).toBeTruthy();

  act(() =>
    setFrontComponentExecutionContext({
      ...CONTEXT,
      selectedRecordIds: ['second-record'],
      selectedObjectMetadata: {
        id: 'opportunity-object',
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
      },
    }),
  );
  expect(screen.getByText('opportunity: second-record')).toBeTruthy();
  expect(screen.queryByText('company: first-record')).toBeNull();

  act(() =>
    setFrontComponentExecutionContext({
      ...CONTEXT,
      selectedRecordIds: [],
      selectedObjectMetadata: null,
    }),
  );
  expect(screen.getByText('No record selected')).toBeTruthy();

  unmount();
  expect(
    (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY],
  ).toEqual(new Set());
});
