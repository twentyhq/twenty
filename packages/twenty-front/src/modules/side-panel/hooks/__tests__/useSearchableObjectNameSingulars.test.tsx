import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

let isWorkflowCoreEnabled = false;

jest.mock('@/object-metadata/hooks/useReadableObjectMetadataItems', () => ({
  useReadableObjectMetadataItems: () => ({
    readableObjectMetadataItems: [
      { nameSingular: 'company', isSearchable: true },
      { nameSingular: 'workflow', isSearchable: true },
      { nameSingular: 'person', isSearchable: true },
    ],
  }),
}));

jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => isWorkflowCoreEnabled,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderSearchableObjectNameSingulars = (
  selectedObjectNameSingular?: string | null,
) =>
  renderHook(
    () => useSearchableObjectNameSingulars({ selectedObjectNameSingular }),
    { wrapper: Wrapper },
  ).result.current;

describe('useSearchableObjectNameSingulars', () => {
  beforeEach(() => {
    isWorkflowCoreEnabled = false;
    jotaiStore.set(sidePanelShowHiddenObjectsState.atom, false);
  });

  it('excludes workflows when the workflow core index page is enabled', () => {
    isWorkflowCoreEnabled = true;

    expect(renderSearchableObjectNameSingulars()).toEqual([
      'company',
      'person',
    ]);
  });

  it('keeps workflows when the workflow core index page is disabled', () => {
    expect(renderSearchableObjectNameSingulars()).toEqual([
      'company',
      'workflow',
      'person',
    ]);
  });

  it('searches nothing when workflows are explicitly selected under the flag', () => {
    isWorkflowCoreEnabled = true;

    expect(renderSearchableObjectNameSingulars('workflow')).toEqual([]);
  });

  it('keeps an explicitly selected object that is not a workflow', () => {
    isWorkflowCoreEnabled = true;

    expect(renderSearchableObjectNameSingulars('company')).toEqual(['company']);
  });
});
