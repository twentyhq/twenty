import { useCommandMenuUpdateNavigationMorphItemsByPage } from '@/command-menu/hooks/useCommandMenuUpdateNavigationMorphItemsByPage';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

const pageId = 'merge-page-id';
const objectMetadataId = 'company-metadata-id';

const Wrapper = ({
  children,
  initialRecordIds,
}: {
  children: React.ReactNode;
  initialRecordIds: string[];
}) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(
        commandMenuNavigationMorphItemsByPageState,
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
    }}
  >
    {children}
  </RecoilRoot>
);

const renderHooks = (initialRecordIds: string[]) =>
  renderHook(
    () => {
      const { updateCommandMenuNavigationMorphItemsByPage } =
        useCommandMenuUpdateNavigationMorphItemsByPage();
      const commandMenuNavigationMorphItemsByPage = useRecoilValue(
        commandMenuNavigationMorphItemsByPageState,
      );

      return {
        updateCommandMenuNavigationMorphItemsByPage,
        commandMenuNavigationMorphItemsByPage,
      };
    },
    {
      wrapper: ({ children }) => (
        <Wrapper initialRecordIds={initialRecordIds}>{children}</Wrapper>
      ),
    },
  );

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
      result.current.commandMenuNavigationMorphItemsByPage.get(pageId),
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
      result.current.commandMenuNavigationMorphItemsByPage.get(pageId),
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
