import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { computeViewGroupsReplacementForView } from '@/views/utils/computeViewGroupsReplacementForView';

const VIEW_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_VIEW_ID = '20202020-0000-0000-0000-000000000002';

const buildExistingViewGroup = (
  viewGroup: Partial<FlatViewGroup>,
): FlatViewGroup => ({
  id: '20202020-1111-0000-0000-000000000001',
  viewId: VIEW_ID,
  fieldValue: 'NEW',
  position: 0,
  isVisible: true,
  ...viewGroup,
});

const buildUpdatedViewGroup = (
  viewGroup: Partial<FlatViewGroup>,
): FlatViewGroup & { createdAt: string; updatedAt: string } => ({
  ...buildExistingViewGroup(viewGroup),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('computeViewGroupsReplacementForView', () => {
  it('should remove the view groups the server no longer returns for the view', () => {
    const { viewGroupIdsToRemove, viewGroupsToAdd } =
      computeViewGroupsReplacementForView({
        viewId: VIEW_ID,
        existingViewGroups: [
          buildExistingViewGroup({ id: 'stale-group-id', fieldValue: 'NEW' }),
        ],
        updatedViewGroups: [
          buildUpdatedViewGroup({ id: 'new-group-id', fieldValue: '' }),
        ],
      });

    expect(viewGroupIdsToRemove).toEqual(['stale-group-id']);
    expect(viewGroupsToAdd).toEqual([
      {
        id: 'new-group-id',
        viewId: VIEW_ID,
        fieldValue: '',
        position: 0,
        isVisible: true,
      },
    ]);
  });

  it('should keep the view groups of the other views untouched', () => {
    const { viewGroupIdsToRemove } = computeViewGroupsReplacementForView({
      viewId: VIEW_ID,
      existingViewGroups: [
        buildExistingViewGroup({ id: 'stale-group-id' }),
        buildExistingViewGroup({
          id: 'other-view-group-id',
          viewId: OTHER_VIEW_ID,
        }),
      ],
      updatedViewGroups: [],
    });

    expect(viewGroupIdsToRemove).toEqual(['stale-group-id']);
  });

  it('should remove every view group of the view when the grouping is removed', () => {
    const { viewGroupIdsToRemove, viewGroupsToAdd } =
      computeViewGroupsReplacementForView({
        viewId: VIEW_ID,
        existingViewGroups: [
          buildExistingViewGroup({ id: 'first-group-id' }),
          buildExistingViewGroup({ id: 'second-group-id' }),
        ],
        updatedViewGroups: [],
      });

    expect(viewGroupIdsToRemove).toEqual(['first-group-id', 'second-group-id']);
    expect(viewGroupsToAdd).toEqual([]);
  });

  it('should not remove a view group the server still returns', () => {
    const { viewGroupIdsToRemove } = computeViewGroupsReplacementForView({
      viewId: VIEW_ID,
      existingViewGroups: [buildExistingViewGroup({ id: 'kept-group-id' })],
      updatedViewGroups: [
        buildUpdatedViewGroup({ id: 'kept-group-id', position: 3 }),
      ],
    });

    expect(viewGroupIdsToRemove).toEqual([]);
  });
});
