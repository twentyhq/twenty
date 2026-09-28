import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { FRONT_COMPONENT_CONTEXT_KEY } from '@/sdk/front-component/constants/front-component-context-key';
import { useSelectedObjectMetadata } from '@/sdk/front-component/hooks/useSelectedObjectMetadata';
import { type FrontComponentExecutionContext } from '@/sdk/front-component/types/FrontComponentExecutionContext';
import { type FrontComponentSelectedObjectMetadata } from '@/sdk/front-component/types/FrontComponentSelectedObjectMetadata';

const EXECUTION_CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
};

const renderUseSelectedObjectMetadata = (
  executionContext: FrontComponentExecutionContext,
): FrontComponentSelectedObjectMetadata | null => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    executionContext;

  let selectedObjectMetadata: FrontComponentSelectedObjectMetadata | null =
    null;

  const SelectedObjectMetadataReader = () => {
    selectedObjectMetadata = useSelectedObjectMetadata();

    return null;
  };

  renderToStaticMarkup(<SelectedObjectMetadataReader />);

  return selectedObjectMetadata;
};

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
});

describe('useSelectedObjectMetadata', () => {
  it('returns null when the host does not provide object metadata', () => {
    expect(renderUseSelectedObjectMetadata(EXECUTION_CONTEXT)).toBeNull();
  });

  it('returns the object metadata provided by the host', () => {
    expect(
      renderUseSelectedObjectMetadata({
        ...EXECUTION_CONTEXT,
        selectedObjectMetadata: {
          id: 'company-object-id',
          nameSingular: 'company',
          namePlural: 'companies',
        },
      }),
    ).toEqual({
      id: 'company-object-id',
      nameSingular: 'company',
      namePlural: 'companies',
    });
  });
});
