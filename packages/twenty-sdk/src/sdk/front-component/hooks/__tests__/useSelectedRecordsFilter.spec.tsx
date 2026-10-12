import { renderToStaticMarkup } from 'react-dom/server';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { afterEach, describe, expect, it } from 'vitest';

import { FRONT_COMPONENT_CONTEXT_KEY } from '@/sdk/front-component/constants/front-component-context-key';
import { useSelectedRecordsFilter } from '@/sdk/front-component/hooks/useSelectedRecordsFilter';
import { type FrontComponentExecutionContext } from '@/sdk/front-component/types/FrontComponentExecutionContext';

const EXECUTION_CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
};

const renderUseSelectedRecordsFilter = (
  executionContext: FrontComponentExecutionContext,
): RecordGqlOperationFilter | null => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    executionContext;

  let selectedRecordsFilter: RecordGqlOperationFilter | null = null;

  const SelectedRecordsFilterReader = () => {
    selectedRecordsFilter = useSelectedRecordsFilter();

    return null;
  };

  renderToStaticMarkup(<SelectedRecordsFilterReader />);

  return selectedRecordsFilter;
};

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
});

describe('useSelectedRecordsFilter', () => {
  it('returns null when the host does not provide a selection filter', () => {
    expect(renderUseSelectedRecordsFilter(EXECUTION_CONTEXT)).toBeNull();
  });

  it('returns the selection filter provided by the host', () => {
    const selectAllFilter: RecordGqlOperationFilter = {
      and: [
        { name: { ilike: '%acme%' } },
        { not: { id: { in: ['excluded-record-id'] } } },
      ],
    };

    expect(
      renderUseSelectedRecordsFilter({
        ...EXECUTION_CONTEXT,
        selectedRecordsFilter: selectAllFilter,
      }),
    ).toEqual(selectAllFilter);
  });
});
