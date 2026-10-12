import { type ObjectRecord } from 'twenty-shared/types';

import { assignManyToOneRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-many-to-one-relation-records.util';
import { assignOneToManyRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-one-to-many-relation-records.util';

const assignActivities = (
  parentRecords: ObjectRecord[],
  relationRecords: ObjectRecord[],
) =>
  assignOneToManyRelationRecords({
    parentRecords,
    relationRecords,
    sourceFieldName: 'activities',
    relatedRecordJoinColumnName: 'opportunityId',
  });

const assignCompanies = (
  parentRecords: ObjectRecord[],
  relationRecords: ObjectRecord[],
  selectedFields: Record<string, unknown> = {},
) =>
  assignManyToOneRelationRecords({
    parentRecords,
    relationRecords,
    sourceFieldName: 'company',
    parentRecordJoinColumnName: 'companyId',
    selectedFields,
  });

describe('relation record assignment', () => {
  it('attaches only matching children in their original order', () => {
    const parents = [{ id: 'first' }, { id: 'second' }, { id: 'empty' }];
    const children = [
      { id: 'activity-1', opportunityId: 'second' },
      { id: 'activity-2', opportunityId: 'first' },
      { id: 'activity-3', opportunityId: 'other' },
      { id: 'activity-4', opportunityId: 'second' },
      { id: 'activity-5', opportunityId: null },
    ];

    assignActivities(parents, children);

    expect(parents).toEqual([
      { id: 'first', activities: [children[1]] },
      { id: 'second', activities: [children[0], children[3]] },
      { id: 'empty', activities: [] },
    ]);
  });

  it('gives each parent its own collection, including repeated parent IDs', () => {
    const parents: ObjectRecord[] = [
      { id: 'first' },
      { id: 'first' },
      { id: 'empty-1' },
      { id: 'empty-2' },
    ];
    const child = { id: 'activity', opportunityId: 'first' };

    assignActivities(parents, [child]);
    parents[0].activities.push({ id: 'new' });
    parents[2].activities.push({ id: 'another' });

    expect(parents[1].activities).toEqual([child]);
    expect(parents[3].activities).toEqual([]);
  });

  it('returns empty collections when no related records are available', () => {
    const parents = [{ id: 'first' }, { id: 'second' }];

    assignActivities(parents, []);

    expect(parents).toEqual([
      { id: 'first', activities: [] },
      { id: 'second', activities: [] },
    ]);
  });

  it('matches shared to-one records and retains the first duplicate result', () => {
    const parents = [
      { id: 'first', companyId: 'company' },
      { id: 'second', companyId: 'company' },
    ];
    const company = { id: 'company', name: 'Original', deletedAt: null };

    assignCompanies(parents, [company, { id: 'company', name: 'Duplicate' }]);

    expect(parents).toEqual([
      {
        id: 'first',
        companyId: 'company',
        company: { id: 'company', name: 'Original' },
      },
      {
        id: 'second',
        companyId: 'company',
        company: { id: 'company', name: 'Original' },
      },
    ]);
    expect(company.deletedAt).toBeNull();
  });

  it('keeps an explicitly selected deletedAt field on an active relation', () => {
    const parents = [{ id: 'first', companyId: 'company' }];
    const company = { id: 'company', deletedAt: null };

    assignCompanies(parents, [company], { deletedAt: true });

    expect(parents).toEqual([{ id: 'first', companyId: 'company', company }]);
  });

  it('clears both the relation and foreign key for a deleted related record', () => {
    const parents = [{ id: 'first', companyId: 'company' }];

    assignCompanies(parents, [{ id: 'company', deletedAt: '2026-01-01' }]);

    expect(parents).toEqual([{ id: 'first', companyId: null, company: null }]);
  });

  it('keeps missing foreign keys intact while returning null relations', () => {
    const parents = [
      { id: 'first', companyId: 'missing' },
      { id: 'second', companyId: null },
      { id: 'third' },
    ];

    assignCompanies(parents, [{ id: 'other' }]);

    expect(parents).toEqual([
      { id: 'first', companyId: 'missing', company: null },
      { id: 'second', companyId: null, company: null },
      { id: 'third', company: null },
    ]);
  });
});
