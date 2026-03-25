import { useSidePanelUpdateNavigationMorphItemsByPage } from '@/side-panel/hooks/useSidePanelUpdateNavigationMorphItemsByPage';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
const pageId = 'merge-page-id';
const objectMetadataId = 'company-metadata-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderHooks = (initialRecordIds: string[]) => {
  jotaiStore.set(
    sidePanelNavigationMorphItemsByPageState.atom,
    new Map([
      [
        pageId,
        initialRecordIds.map((recordId) => ({
          objectMetadataId,
          recordId,
        })),
      ],
    ]),
  );

  return renderHook(
    () => {
      const { updateSidePanelNavigationMorphItemsByPage } =
        useSidePanelUpdateNavigationMorphItemsByPage();

      return {
        updateSidePanelNavigationMorphItemsByPage,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
};

describe('useSidePanelUpdateNavigationMorphItemsByPage', () => {
  it('should replace existing items for a page instead of appending', async () => {
    const { result } = renderHooks(['record-1', 'record-2']);

    await act(async () => {
      await result.current.updateSidePanelNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-2', 'record-1'],
      });
    });

    expect(
      jotaiStore.get(sidePanelNavigationMorphItemsByPageState.atom).get(pageId),
    ).toEqual([
      {
        objectMetadataId,
        recordId: 'record-2',
      },
      {
        objectMetadataId,
        recordId: 'record-1',
      },
    ]);
  });

  it('should keep only the latest payload when called twice for the same page', async () => {
    const { result } = renderHooks([]);

    await act(async () => {
      await result.current.updateSidePanelNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-1', 'record-2'],
      });
      await result.current.updateSidePanelNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-2', 'record-1'],
      });
    });

    expect(
      jotaiStore.get(sidePanelNavigationMorphItemsByPageState.atom).get(pageId),
    ).toEqual([
      {
        objectMetadataId,
        recordId: 'record-2',
      },
      {
        objectMetadataId,
        recordId: 'record-1',
      },
    ]);
  });
});
