import { act, renderHook } from '@testing-library/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockCreateOneNote = jest.fn();
const mockCreateOneNoteTarget = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) =>
    objectNameSingular === CoreObjectNameSingular.NoteTarget
      ? { createOneRecord: mockCreateOneNoteTarget }
      : { createOneRecord: mockCreateOneNote },
}));

const mockOpenRecordInCommandMenu = jest.fn();

jest.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: mockOpenRecordInCommandMenu,
  }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const fakeNoteId = 'fake-note-id';

describe('useOpenCreateActivityDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOneNote.mockResolvedValue({ id: fakeNoteId });
    mockCreateOneNoteTarget.mockResolvedValue({
      id: 'fake-note-target-id',
    });
  });

  it('should create a note and note target then open the record in the command menu', async () => {
    const { result } = renderHook(
      () =>
        useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current({
        targetableObjects: [],
      });
    });

    expect(mockCreateOneNote).toHaveBeenCalledWith({
      position: 'last',
    });

    expect(mockCreateOneNoteTarget).toHaveBeenCalledWith({
      noteId: fakeNoteId,
    });

    expect(mockOpenRecordInCommandMenu).toHaveBeenCalledWith({
      recordId: fakeNoteId,
      objectNameSingular: CoreObjectNameSingular.Note,
      isNewRecord: true,
    });

    expect(jotaiStore.get(viewableRecordIdState.atom)).toBe(fakeNoteId);
    expect(jotaiStore.get(viewableRecordNameSingularState.atom)).toBe(
      CoreObjectNameSingular.Note,
    );
    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual([]);
    expect(jotaiStore.get(isUpsertingActivityInDBState.atom)).toBe(false);
  });

  it('should create a note target with the targetable object relation when targets are provided', async () => {
    const targetableObjects = [
      {
        id: 'company-id',
        targetObjectNameSingular: CoreObjectNameSingular.Company,
      },
    ];

    const { result } = renderHook(
      () =>
        useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current({
        targetableObjects,
      });
    });

    expect(mockCreateOneNote).toHaveBeenCalledWith({
      position: 'last',
    });

    expect(mockCreateOneNoteTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        noteId: fakeNoteId,
      }),
    );

    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual(
      targetableObjects,
    );
  });
});
