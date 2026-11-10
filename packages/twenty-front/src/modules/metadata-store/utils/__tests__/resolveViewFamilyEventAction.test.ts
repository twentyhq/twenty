import { resolveViewFamilyEventAction } from '@/metadata-store/utils/resolveViewFamilyEventAction';

const KNOWN_VIEW_IDS = new Set(['known-view']);

describe('resolveViewFamilyEventAction', () => {
  it('applies an update to a view already in the store', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'views',
        operation: { type: 'update', updatedRecord: { id: 'known-view' } },
        removedViewIds: [],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('apply');
  });

  it('hydrates when a view the client never had is updated, as on gaining access', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'views',
        operation: { type: 'update', updatedRecord: { id: 'new-view' } },
        removedViewIds: [],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('hydrate');
  });

  it('never lets a late update recreate a removed view, and hydrates instead', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'views',
        operation: { type: 'update', updatedRecord: { id: 'removed-view' } },
        removedViewIds: ['removed-view'],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('hydrate');
  });

  it('skips a late child upsert under a removed view', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'viewFields',
        operation: {
          type: 'create',
          createdRecord: { id: 'view-field', viewId: 'removed-view' },
        },
        removedViewIds: ['removed-view'],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('skip');
  });

  it('applies a newly created view live', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'views',
        operation: { type: 'create', createdRecord: { id: 'new-view' } },
        removedViewIds: [],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('apply');
  });

  it('applies removals', () => {
    expect(
      resolveViewFamilyEventAction({
        entityKey: 'views',
        operation: { type: 'delete', deletedRecordId: 'known-view' },
        removedViewIds: [],
        knownViewIds: KNOWN_VIEW_IDS,
      }),
    ).toBe('apply');
  });
});
