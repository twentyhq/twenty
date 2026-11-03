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
      { nameSingular: 'auditLog', isSearchable: false },
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

  it('searches the searchable objects', () => {
    expect(renderSearchableObjectNameSingulars()).toEqual([
      'company',
      'person',
    ]);
  });

  it('includes hidden objects when asked to', () => {
    jotaiStore.set(sidePanelShowHiddenObjectsState.atom, true);

    expect(renderSearchableObjectNameSingulars()).toEqual([
      'company',
      'auditLog',
      'person',
    ]);
  });

  it('keeps an explicitly selected object', () => {
    expect(renderSearchableObjectNameSingulars('company')).toEqual(['company']);
  });
});
