import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/object-metadata/hooks/useReadableObjectMetadataItems', () => ({
  useReadableObjectMetadataItems: () => ({
    readableObjectMetadataItems: [
      { nameSingular: 'company', isSearchable: true },
      { nameSingular: 'workflow', isSearchable: true },
      { nameSingular: 'person', isSearchable: true },
    ],
  }),
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
    jotaiStore.set(sidePanelShowHiddenObjectsState.atom, false);
  });

  it('excludes workflows', () => {
    expect(renderSearchableObjectNameSingulars()).toEqual([
      'company',
      'person',
    ]);
  });

  it('searches nothing when workflows are explicitly selected', () => {
    expect(renderSearchableObjectNameSingulars('workflow')).toEqual([]);
  });

  it('keeps an explicitly selected object that is not a workflow', () => {
    expect(renderSearchableObjectNameSingulars('company')).toEqual(['company']);
  });
});
