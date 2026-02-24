import { useCommandMenuUpdateNavigationMorphItemsByPage } from '@/command-menu/hooks/useCommandMenuUpdateNavigationMorphItemsByPage';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

const pageId = 'merge-page-id';
const objectMetadataId = 'company-metadata-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

const renderHooks = (initialRecordIds: string[]) => {
  jotaiStore.set(
    commandMenuNavigationMorphItemsByPageState.atom,
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
      const { updateCommandMenuNavigationMorphItemsByPage } =
        useCommandMenuUpdateNavigationMorphItemsByPage();

      return {
        updateCommandMenuNavigationMorphItemsByPage,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
};

describe('useCommandMenuUpdateNavigationMorphItemsByPage', () => {
  it('should replace existing items for a page instead of appending', async () => {
    const { result } = renderHooks(['record-1', 'record-2']);

    await act(async () => {
      await result.current.updateCommandMenuNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-2', 'record-1'],
      });
    });

    expect(
      jotaiStore
        .get(commandMenuNavigationMorphItemsByPageState.atom)
        .get(pageId),
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
      await result.current.updateCommandMenuNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-1', 'record-2'],
      });
      await result.current.updateCommandMenuNavigationMorphItemsByPage({
        pageId,
        objectMetadataId,
        objectRecordIds: ['record-2', 'record-1'],
      });
    });

    expect(
      jotaiStore
        .get(commandMenuNavigationMorphItemsByPageState.atom)
        .get(pageId),
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
