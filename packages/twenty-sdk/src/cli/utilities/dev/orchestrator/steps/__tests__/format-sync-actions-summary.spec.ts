import { type SyncAction } from 'twenty-shared/metadata';
import { describe, expect, it } from 'vitest';

import { formatSyncActionsSummary } from '@/cli/utilities/dev/orchestrator/steps/format-sync-actions-summary';

describe('formatSyncActionsSummary', () => {
  it('reports no changes when the actions list is empty', () => {
    expect(formatSyncActionsSummary([])).toEqual([
      { message: 'No metadata changes', status: 'info' },
    ]);
  });

  it('reports no changes when actions are missing from the response', () => {
    expect(formatSyncActionsSummary(undefined)).toEqual([
      { message: 'No metadata changes', status: 'info' },
    ]);
  });

  it('summarizes created, updated and deleted actions with their names', () => {
    const events = formatSyncActionsSummary([
      {
        type: 'create',
        metadataName: 'objectMetadata',
        flatEntity: {
          universalIdentifier: 'uid-object',
          nameSingular: 'rocket',
        },
      },
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: {
          universalIdentifier: 'uid-field',
          name: 'timelineActivities',
        },
      },
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'uid-updated-field',
      },
      {
        type: 'delete',
        metadataName: 'pageLayout',
        universalIdentifier: 'uid-page-layout',
      },
    ]);

    expect(events).toEqual([
      {
        message: 'Metadata changes: 2 created, 1 updated, 1 deleted',
        status: 'info',
      },
      { message: '  created objectMetadata rocket', status: 'info' },
      { message: '  created fieldMetadata timelineActivities', status: 'info' },
      { message: '  updated fieldMetadata uid-updated-field', status: 'info' },
      { message: '  deleted pageLayout uid-page-layout', status: 'info' },
    ]);
  });

  it('shows the name and uuid for updated/deleted entities when flatEntity is present', () => {
    const events = formatSyncActionsSummary([
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: '94265b02-25b4-4bd3-9dae-669f9e983c0f',
        flatEntity: { name: 'myField' },
      },
      {
        type: 'delete',
        metadataName: 'objectMetadata',
        universalIdentifier: 'c1a2b3c4-d5e6-4f78-9a01-234567890abc',
        flatEntity: { nameSingular: 'rocket' },
      },
    ]);

    expect(events).toEqual([
      {
        message: 'Metadata changes: 1 updated, 1 deleted',
        status: 'info',
      },
      {
        message:
          '  updated fieldMetadata myField (94265b02-25b4-4bd3-9dae-669f9e983c0f)',
        status: 'info',
      },
      {
        message:
          '  deleted objectMetadata rocket (c1a2b3c4-d5e6-4f78-9a01-234567890abc)',
        status: 'info',
      },
    ]);
  });

  it('shows changed fields in brackets for update actions with diff', () => {
    const events = formatSyncActionsSummary([
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: '94265b02-25b4-4bd3-9dae-669f9e983c0f',
        flatEntity: { name: 'myField' },
        diff: {
          label: { before: 'Old Label', after: 'New Label' },
          description: { before: null, after: 'A description' },
        },
      },
    ]);

    expect(events).toEqual([
      {
        message: 'Metadata changes: 1 updated',
        status: 'info',
      },
      {
        message:
          '  updated fieldMetadata myField (94265b02-25b4-4bd3-9dae-669f9e983c0f) [label, description changed]',
        status: 'info',
      },
    ]);
  });

  it('falls back to the universal identifier when a created entity has no name', () => {
    const events = formatSyncActionsSummary([
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: { universalIdentifier: 'uid-nameless' },
      },
    ]);

    expect(events).toEqual([
      { message: 'Metadata changes: 1 created', status: 'info' },
      { message: '  created fieldMetadata uid-nameless', status: 'info' },
    ]);
  });

  it('truncates the detail lines when there are more changes than the display limit', () => {
    const actions: SyncAction[] = Array.from({ length: 55 }, (_, index) => ({
      type: 'create' as const,
      metadataName: 'fieldMetadata' as const,
      flatEntity: {
        universalIdentifier: `uid-${index}`,
        name: `field${index}`,
      },
    }));

    const events = formatSyncActionsSummary(actions);

    expect(events[0]).toEqual({
      message: 'Metadata changes: 55 created',
      status: 'info',
    });
    expect(events).toHaveLength(52);
    expect(events[51]).toEqual({
      message: '  …and 5 more change(s)',
      status: 'info',
    });
  });
});
