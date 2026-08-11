import { type View } from '@/views/types/View';
import { computeViewStacks } from '@/views/view-stack/utils/computeViewStacks';

const buildView = ({
  id,
  position,
  parentViewId = null,
}: {
  id: string;
  position: number;
  parentViewId?: string | null;
}) => ({ id, position, parentViewId, name: id }) as View;

describe('computeViewStacks', () => {
  it('should return an empty list when there is no view', () => {
    expect(computeViewStacks([])).toEqual([]);
  });

  it('should turn parentless views into stacks ordered by position', () => {
    const viewStacks = computeViewStacks([
      buildView({ id: 'second', position: 2 }),
      buildView({ id: 'first', position: 1 }),
    ]);

    expect(viewStacks.map((viewStack) => viewStack.rootView.id)).toEqual([
      'first',
      'second',
    ]);
    expect(
      viewStacks.every((viewStack) => viewStack.childViews.length === 0),
    ).toBe(true);
  });

  it('should nest child views under their parent ordered by position', () => {
    const viewStacks = computeViewStacks([
      buildView({ id: 'root', position: 0 }),
      buildView({ id: 'child-b', position: 2, parentViewId: 'root' }),
      buildView({ id: 'child-a', position: 1, parentViewId: 'root' }),
    ]);

    expect(viewStacks).toHaveLength(1);
    expect(viewStacks[0].childViews.map((childView) => childView.id)).toEqual([
      'child-a',
      'child-b',
    ]);
  });

  it('should promote a view whose parent is missing to a stack of its own', () => {
    const viewStacks = computeViewStacks([
      buildView({ id: 'root', position: 0 }),
      buildView({ id: 'orphan', position: 1, parentViewId: 'deleted-view' }),
    ]);

    expect(viewStacks.map((viewStack) => viewStack.rootView.id)).toEqual([
      'root',
      'orphan',
    ]);
  });

  it('should not attach a child to a stack it does not belong to', () => {
    const viewStacks = computeViewStacks([
      buildView({ id: 'root-a', position: 0 }),
      buildView({ id: 'root-b', position: 1 }),
      buildView({ id: 'child', position: 2, parentViewId: 'root-b' }),
    ]);

    expect(viewStacks[0].childViews).toEqual([]);
    expect(viewStacks[1].childViews.map((childView) => childView.id)).toEqual([
      'child',
    ]);
  });
});
