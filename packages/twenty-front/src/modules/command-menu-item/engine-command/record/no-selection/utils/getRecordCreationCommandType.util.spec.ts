// oxlint-disable twenty/folder-structure -- Utility specs intentionally live beside their implementation.
import { getRecordCreationCommandType } from '@/command-menu-item/engine-command/record/no-selection/utils/getRecordCreationCommandType';

it.each([
  {
    objectNameSingular: 'company',
    creationTargetObjectMetadataId: 'company-id',
    expected: 'global',
  },
  {
    objectNameSingular: 'task',
    creationTargetObjectMetadataId: 'task-id',
    expected: 'global',
  },
  {
    objectNameSingular: 'company',
    creationTargetObjectMetadataId: null,
    expected: 'index',
  },
  {
    objectNameSingular: 'task',
    creationTargetObjectMetadataId: undefined,
    expected: 'index',
  },
  {
    objectNameSingular: 'workflow',
    creationTargetObjectMetadataId: 'workflow-id',
    expected: 'workflow',
  },
  {
    objectNameSingular: 'workflow',
    creationTargetObjectMetadataId: null,
    expected: 'workflow',
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
        objectNameSingular: 'company',
        creationTargetObjectMetadataId: 'company-id',
        ...context,
      }),
    ).toBe(expected);
  },
);

it('uses global creation for the current object in a trash view', () => {
  expect(
    getRecordCreationCommandType({
      objectNameSingular: 'company',
      contextObjectMetadataId: 'company-id',
      creationTargetObjectMetadataId: 'company-id',
      recordIndexId: 'company-index',
      hasAnySoftDeleteFilterOnView: true,
    }),
  ).toBe('global');
});
