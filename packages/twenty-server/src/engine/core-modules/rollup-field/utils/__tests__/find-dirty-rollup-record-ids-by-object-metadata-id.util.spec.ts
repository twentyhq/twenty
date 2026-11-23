import { findDirtyRollupRecordIdsByObjectMetadataId } from 'src/engine/core-modules/rollup-field/utils/find-dirty-rollup-record-ids-by-object-metadata-id.util';

const WATCH_PLANS = [
  {
    parentObjectMetadataId: 'project-object-id',
    childJoinColumnName: 'projectId',
    watchedFieldNames: ['projectId', 'estimate', 'isDone'],
  },
];

describe('findDirtyRollupRecordIdsByObjectMetadataId', () => {
  it('should mark the parent of a created record', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [{ properties: { after: { projectId: 'project-1' } } }],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: false,
      }),
    ).toEqual({ 'project-object-id': ['project-1'] });
  });

  it('should mark the parent of a deleted record even though only deletedAt changed', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [
          {
            properties: {
              before: { projectId: 'project-1' },
              after: { projectId: 'project-1' },
              updatedFields: ['deletedAt'],
            },
          },
        ],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: false,
      }),
    ).toEqual({ 'project-object-id': ['project-1'] });
  });

  it('should mark both parents when a record moves to another parent', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [
          {
            properties: {
              before: { projectId: 'project-1' },
              after: { projectId: 'project-2' },
              updatedFields: ['project', 'projectId'],
            },
          },
        ],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: true,
      }),
    ).toEqual({ 'project-object-id': ['project-1', 'project-2'] });
  });

  it('should mark the parent when the aggregated or a filter field is updated', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [
          {
            properties: {
              before: { projectId: 'project-1' },
              after: { projectId: 'project-1' },
              updatedFields: ['isDone'],
            },
          },
        ],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: true,
      }),
    ).toEqual({ 'project-object-id': ['project-1'] });
  });

  it('should ignore an update that touches no watched field', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [
          {
            properties: {
              before: { projectId: 'project-1' },
              after: { projectId: 'project-1' },
              updatedFields: ['name'],
            },
          },
        ],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: true,
      }),
    ).toEqual({});
  });

  it('should ignore a record without a parent and deduplicate parents', () => {
    expect(
      findDirtyRollupRecordIdsByObjectMetadataId({
        events: [
          { properties: { after: { projectId: null } } },
          { properties: { after: { projectId: 'project-1' } } },
          { properties: { after: { projectId: 'project-1' } } },
        ],
        watchPlans: WATCH_PLANS,
        isRecordUpdate: false,
      }),
    ).toEqual({ 'project-object-id': ['project-1'] });
  });
});
