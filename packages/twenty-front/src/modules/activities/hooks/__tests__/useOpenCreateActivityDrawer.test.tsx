import { act, renderHook } from '@testing-library/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-side-panel/states/viewableRecordNameSingularState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockCreateOneNote = jest.fn();
const mockCreateManyNoteTargets = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneNote }),
}));

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({
    createManyRecords: mockCreateManyNoteTargets,
  }),
}));

const mockOpenRecordInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
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
    mockCreateManyNoteTargets.mockResolvedValue([]);
  });

  it('should create a note without an empty junction record then open the side panel', async () => {
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

    expect(mockCreateManyNoteTargets).not.toHaveBeenCalled();

    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
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

  it('should create every requested target through junction metadata', async () => {
    const targetableObjects = [
      {
        id: 'company-id',
        targetObjectNameSingular: CoreObjectNameSingular.Company,
      },
      {
        id: 'person-id',
        targetObjectNameSingular: CoreObjectNameSingular.Person,
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

    expect(mockCreateManyNoteTargets).toHaveBeenCalledWith({
      recordsToCreate: [
        expect.objectContaining({
          noteId: fakeNoteId,
          targetCompanyId: 'company-id',
        }),
        expect.objectContaining({
          noteId: fakeNoteId,
          targetPersonId: 'person-id',
        }),
      ],
      upsert: true,
    });

    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual(
      targetableObjects,
    );
  });

  it('should ignore targets not supported by the junction metadata', async () => {
    const unsupportedTarget = {
      id: 'unsupported-id',
      targetObjectNameSingular: 'unsupportedObject',
    };

    const { result } = renderHook(
      () =>
        useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current({
        targetableObjects: [unsupportedTarget],
      });
    });

    expect(mockCreateManyNoteTargets).not.toHaveBeenCalled();
    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
      recordId: fakeNoteId,
      objectNameSingular: CoreObjectNameSingular.Note,
      isNewRecord: true,
    });
    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual([]);
  });
});
