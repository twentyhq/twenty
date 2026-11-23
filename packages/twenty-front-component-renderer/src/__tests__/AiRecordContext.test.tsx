import { act, render, screen } from '@testing-library/react';
import {
  type FrontComponentExecutionContext,
  useSelectedObjectMetadata,
  useSelectedRecordIds,
  useRecordId,
  useColorScheme,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';
import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';
import { getFrontComponentExecutionContextListeners } from '@/remote/worker/environment/utils/getFrontComponentExecutionContextListeners';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';

const RecordWidget = () => {
  const recordId = useSelectedRecordIds()[0];
  const objectMetadata = useSelectedObjectMetadata();
  const recordContextId = useRecordId();
  const colorScheme = useColorScheme();
  const userId = useFrontComponentExecutionContext((context) => context.userId);

  return (
    <div>
      <p>
        {recordId
          ? `${objectMetadata?.nameSingular}: ${recordId}`
          : 'No record selected'}
      </p>
      <p>Record: {recordContextId ?? 'none'}</p>
      <p>Theme: {colorScheme}</p>
      <p>User: {userId ?? 'none'}</p>
    </div>
  );
};

const CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'component',
  userId: null,
  recordId: 'first-record',
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
  toGlobalScopeRecord(globalThis)[FRONT_COMPONENT_CONTEXT_KEY] = undefined;
  getFrontComponentExecutionContextListeners().clear();
});

it('updates SDK hooks when the renderer changes the viewed record or clears selection', () => {
  setFrontComponentExecutionContext(CONTEXT);
  const { unmount } = render(<RecordWidget />);

  expect(screen.getByText('company: first-record')).toBeTruthy();
  expect(screen.getByText('Record: first-record')).toBeTruthy();
  expect(screen.getByText('Theme: light')).toBeTruthy();
  expect(screen.getByText('User: none')).toBeTruthy();

  act(() =>
    setFrontComponentExecutionContext({
      ...CONTEXT,
      selectedRecordIds: ['second-record'],
      recordId: 'second-record',
      colorScheme: 'dark',
      userId: 'preview-user',
      selectedObjectMetadata: {
        id: 'opportunity-object',
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
      },
    }),
  );
  expect(screen.getByText('opportunity: second-record')).toBeTruthy();
  expect(screen.getByText('Record: second-record')).toBeTruthy();
  expect(screen.getByText('Theme: dark')).toBeTruthy();
  expect(screen.getByText('User: preview-user')).toBeTruthy();
  expect(screen.queryByText('company: first-record')).toBeNull();

  act(() =>
    setFrontComponentExecutionContext({
      ...CONTEXT,
      selectedRecordIds: [],
      recordId: null,
      selectedObjectMetadata: null,
    }),
  );
  expect(screen.getByText('No record selected')).toBeTruthy();

  unmount();
  expect(getFrontComponentExecutionContextListeners().size).toBe(0);
});
