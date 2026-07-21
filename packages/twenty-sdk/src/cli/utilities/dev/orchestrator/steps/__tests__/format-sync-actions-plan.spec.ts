import chalk from 'chalk';
import { type SyncAction } from 'twenty-shared/metadata';
import { describe, expect, it } from 'vitest';

import {
  countDestructiveActions,
  formatSyncActionsPlan,
  formatValue,
  hasDestructiveActions,
  selectEntityAttributes,
} from '@/cli/utilities/dev/orchestrator/steps/format-sync-actions-plan';

chalk.level = 0;

describe('formatSyncActionsPlan', () => {
  it('should report no changes when actions are empty', () => {
    expect(formatSyncActionsPlan([])).toBe(
      'No changes. Twenty metadata matches your manifest.',
    );
  });

  it('should report no changes when actions are undefined', () => {
    expect(formatSyncActionsPlan(undefined)).toBe(
      'No changes. Twenty metadata matches your manifest.',
    );
  });

  it('should render the whole plan for a create block', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'objectMetadata',
        flatEntity: {
          icon: 'IconRocket',
          namePlural: 'rockets',
          nameSingular: 'rocket',
          labelSingular: 'Rocket',
        },
      },
    ]);

    expect(plan).toMatchInlineSnapshot(`
      "Twenty will perform the following actions:

        # objectMetadata "rocket" will be created
        + icon          = "IconRocket"
        + labelSingular = "Rocket"
        + namePlural    = "rockets"
        + nameSingular  = "rocket"

      Plan: 1 to add, 0 to change, 0 to destroy."
    `);
  });

  it('should filter internal keys and null values from create blocks', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: {
          id: 'uuid',
          workspaceId: 'ws',
          createdAt: '2026-01-01',
          objectMetadataId: 'obj',
          universalIdentifier: 'field-name',
          description: null,
          name: 'name',
          label: 'Name',
        },
      },
    ]);

    expect(plan).not.toContain('workspaceId');
    expect(plan).not.toContain('createdAt');
    expect(plan).not.toContain('objectMetadataId');
    expect(plan).not.toContain('description');
    expect(plan).toContain('+ name');
    expect(plan).toContain('+ label');
  });

  it('should render only changed keys for updates as before -> after', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-stage',
        flatEntity: { name: 'stage' },
        diff: {
          label: { before: 'Stage', after: 'Launch stage' },
          isNullable: { before: true, after: false },
        },
      },
    ]);

    expect(plan).toContain('# fieldMetadata "stage" will be updated in-place');
    expect(plan).toContain('~ label      = "Stage" -> "Launch stage"');
    expect(plan).toContain('~ isNullable = true -> false');
    expect(plan).toContain('Plan: 0 to add, 1 to change, 0 to destroy.');
  });

  it('should JSON-encode object and array values in update diffs', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-options',
        diff: {
          options: {
            before: [{ value: 'A' }],
            after: [{ value: 'A' }, { value: 'B' }],
          },
        },
      },
    ]);

    expect(plan).toContain('[{"value":"A"}] -> [{"value":"A"},{"value":"B"}]');
  });

  it('should skip an update block when its diff is empty but still count it', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-noop',
        diff: {},
      },
    ]);

    expect(plan).not.toContain('updated in-place');
    expect(plan).toContain('Plan: 0 to add, 1 to change, 0 to destroy.');
  });

  it('should warn that an object delete drops the table', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'delete',
        metadataName: 'objectMetadata',
        universalIdentifier: 'obj-old',
        flatEntity: { nameSingular: 'oldThing' },
      },
    ]);

    expect(plan).toContain('# objectMetadata "oldThing" will be destroyed');
    expect(plan).toContain('drops the table and all its rows');
    expect(plan).toContain('Destroys are irreversible');
  });

  it('should warn that a field delete drops the column', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'delete',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-legacy',
        flatEntity: { name: 'legacyCode', label: 'Legacy code' },
      },
    ]);

    expect(plan).toContain('drops the column and its data');
  });

  it('should not render a destructive warning when there are no deletes', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: { name: 'name' },
      },
    ]);

    expect(plan).not.toContain('Warning:');
  });

  it('should show a non-object/field delete without a data-loss warning', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'delete',
        metadataName: 'view',
        universalIdentifier: 'v',
        flatEntity: { name: 'My view' },
      },
    ]);

    expect(plan).toContain('# view "My view" will be destroyed');
    expect(plan).toContain('Plan: 0 to add, 0 to change, 1 to destroy.');
    expect(plan).not.toContain('Warning:');
  });

  it('should group by type ordered by first appearance, create before delete within a group', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'delete',
        metadataName: 'objectMetadata',
        universalIdentifier: 'obj-old',
        flatEntity: { nameSingular: 'oldObject' },
      },
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: { name: 'newField' },
      },
      {
        type: 'create',
        metadataName: 'objectMetadata',
        flatEntity: { nameSingular: 'newObject' },
      },
    ]);

    const newObjectIndex = plan.indexOf('"newObject"');
    const oldObjectIndex = plan.indexOf('"oldObject"');
    const newFieldIndex = plan.indexOf('"newField"');

    expect(newObjectIndex).toBeLessThan(oldObjectIndex);
    expect(oldObjectIndex).toBeLessThan(newFieldIndex);
    expect(plan).toContain('Plan: 2 to add, 0 to change, 1 to destroy.');
  });

  it('should align the equals signs within a block', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: { name: 'name', isNullable: true },
      },
    ]);

    const equalsColumns = plan
      .split('\n')
      .filter((line) => line.includes(' = '))
      .map((line) => line.indexOf('='));

    expect(new Set(equalsColumns).size).toBe(1);
  });

  it('should render unknown metadata names without throwing', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'somethingNew',
        flatEntity: { name: 'thing' },
      } as unknown as SyncAction,
    ]);

    expect(plan).toContain('# somethingNew "thing" will be created');
  });

  it('should render unknown as the name when flatEntity is missing on create', () => {
    const plan = formatSyncActionsPlan([
      { type: 'create', metadataName: 'fieldMetadata' },
    ]);

    expect(plan).toContain('# fieldMetadata "unknown" will be created');
  });

  it('should mask the value of a secret application variable', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'applicationVariable',
        flatEntity: { name: 'API_KEY', value: 'super-secret', isSecret: true },
      },
    ]);

    expect(plan).toContain('value');
    expect(plan).toContain('(secret)');
    expect(plan).not.toContain('super-secret');
  });

  it('should show the value of a non-secret application variable', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'applicationVariable',
        flatEntity: {
          name: 'BASE_URL',
          value: 'https://example.com',
          isSecret: false,
        },
      },
    ]);

    expect(plan).toContain('"https://example.com"');
  });

  it('should mask secret application variable values in update diffs', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'applicationVariable',
        universalIdentifier: 'var-1',
        flatEntity: { name: 'API_KEY', isSecret: true },
        diff: { value: { before: 'old-secret', after: 'new-secret' } },
      },
    ]);

    expect(plan).toContain('~ value = (secret) -> (secret)');
    expect(plan).not.toContain('old-secret');
    expect(plan).not.toContain('new-secret');
  });

  it('should fail closed and mask application variable values when secrecy is unknown', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'create',
        metadataName: 'applicationVariable',
        flatEntity: { name: 'API_KEY', value: 'maybe-secret' },
      },
    ]);

    expect(plan).toContain('(secret)');
    expect(plan).not.toContain('maybe-secret');
  });

  it('should fail closed for application variable value updates missing isSecret metadata', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'applicationVariable',
        universalIdentifier: 'var-1',
        diff: { value: { before: 'old-secret', after: 'new-secret' } },
      },
    ]);

    expect(plan).toContain('~ value = (secret) -> (secret)');
    expect(plan).not.toContain('old-secret');
    expect(plan).not.toContain('new-secret');
  });

  it('should show the value when an update marks the variable non-secret', () => {
    const plan = formatSyncActionsPlan([
      {
        type: 'update',
        metadataName: 'applicationVariable',
        universalIdentifier: 'var-1',
        diff: {
          value: { before: 'a', after: 'b' },
          isSecret: { before: true, after: false },
        },
      },
    ]);

    expect(plan).toContain('"a" -> "b"');
    expect(plan).not.toContain('(secret)');
  });
});

describe('formatValue', () => {
  it('should quote strings', () => {
    expect(formatValue('rocket')).toBe('"rocket"');
  });

  it('should render booleans and numbers without quotes', () => {
    expect(formatValue(true)).toBe('true');
    expect(formatValue(42)).toBe('42');
  });

  it('should render null and undefined as null', () => {
    expect(formatValue(null)).toBe('null');
    expect(formatValue(undefined)).toBe('null');
  });

  it('should compactly JSON-encode arrays', () => {
    expect(formatValue([{ value: 'A' }])).toBe('[{"value":"A"}]');
  });

  it('should truncate long values', () => {
    const long = 'x'.repeat(200);
    const rendered = formatValue(long);

    expect(rendered.length).toBeLessThanOrEqual(81);
    expect(rendered.endsWith('…')).toBe(true);
  });
});

describe('selectEntityAttributes', () => {
  it('should return an empty array when flatEntity is missing', () => {
    expect(selectEntityAttributes(undefined)).toEqual([]);
  });
});

describe('hasDestructiveActions and countDestructiveActions', () => {
  const actions: SyncAction[] = [
    {
      type: 'create',
      metadataName: 'fieldMetadata',
      flatEntity: { name: 'a' },
    },
    {
      type: 'delete',
      metadataName: 'fieldMetadata',
      universalIdentifier: 'b',
      flatEntity: { name: 'b' },
    },
    {
      type: 'delete',
      metadataName: 'objectMetadata',
      universalIdentifier: 'c',
      flatEntity: { nameSingular: 'c' },
    },
  ];

  const viewDeleteOnly: SyncAction[] = [
    {
      type: 'delete',
      metadataName: 'view',
      universalIdentifier: 'v',
      flatEntity: { name: 'v' },
    },
  ];

  it('should detect object and field deletes as destructive', () => {
    expect(hasDestructiveActions(actions)).toBe(true);
    expect(hasDestructiveActions([])).toBe(false);
    expect(hasDestructiveActions(undefined)).toBe(false);
  });

  it('should not treat non-object/field deletes as destructive', () => {
    expect(hasDestructiveActions(viewDeleteOnly)).toBe(false);
    expect(countDestructiveActions(viewDeleteOnly)).toBe(0);
  });

  it('should count only object and field deletes', () => {
    expect(countDestructiveActions(actions)).toBe(2);
    expect(countDestructiveActions(undefined)).toBe(0);
  });
});
