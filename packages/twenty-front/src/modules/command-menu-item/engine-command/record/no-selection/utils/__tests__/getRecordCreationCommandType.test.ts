// oxlint-disable twenty/folder-structure -- Utility specs intentionally live beside their implementation.
import { getRecordCreationCommandType } from '@/command-menu-item/engine-command/record/no-selection/utils/getRecordCreationCommandType';

it.each([
  {
    creationTargetObjectMetadataId: 'company-id',
    expected: 'global',
  },
  {
    creationTargetObjectMetadataId: 'task-id',
    expected: 'global',
  },
  {
    creationTargetObjectMetadataId: null,
    expected: 'index',
  },
  {
    creationTargetObjectMetadataId: undefined,
    expected: 'index',
  },
])('dispatches record creation to $expected: %j', ({ expected, ...params }) => {
  expect(getRecordCreationCommandType(params)).toBe(expected);
});

it.each([
  {
    contextObjectMetadataId: 'company-id',
    recordIndexId: 'company-index',
    expected: 'index',
  },
  {
    contextObjectMetadataId: 'task-id',
    recordIndexId: 'task-index',
    expected: 'global',
  },
  {
    contextObjectMetadataId: 'company-id',
    recordIndexId: null,
    expected: 'global',
  },
  { contextObjectMetadataId: null, recordIndexId: null, expected: 'global' },
])(
  'uses $expected creation for the available index context: %j',
  ({ expected, ...context }) => {
    expect(
      getRecordCreationCommandType({
        creationTargetObjectMetadataId: 'company-id',
        ...context,
      }),
    ).toBe(expected);
  },
);

it('uses global creation for the current object in a trash view', () => {
  expect(
    getRecordCreationCommandType({
      contextObjectMetadataId: 'company-id',
      creationTargetObjectMetadataId: 'company-id',
      recordIndexId: 'company-index',
      hasAnySoftDeleteFilterOnView: true,
    }),
  ).toBe('global');
});
