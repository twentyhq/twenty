import { describe, expect, it } from 'vitest';

import { formatAppPlanActions } from '@/app/deployment/format-app-plan';
import { getAppPlanSummary } from '@/app/deployment/get-app-plan-summary';
import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';

const deletion = (
  metadataName: string,
  universalIdentifier: string,
  flatEntity: Record<string, unknown> = {},
): AppPlanAction => ({
  type: 'delete',
  metadataName,
  universalIdentifier,
  flatEntity,
});

// Shaped after a real plan: an app object is removed along with everything
// the server attaches to it, next to a field removed from a kept object.
const ACTIONS: AppPlanAction[] = [
  deletion('objectMetadata', 'run-object', { nameSingular: 'workflowRun' }),
  deletion('fieldMetadata', 'run-name', {
    name: 'workflowName',
    objectMetadataUniversalIdentifier: 'run-object',
  }),
  deletion('fieldMetadata', 'run-created-at', {
    name: 'createdAt',
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: 'run-object',
  }),
  deletion('fieldMetadata', 'run-note-targets', {
    name: 'noteTargets',
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: 'run-object',
    relationTargetFieldMetadataUniversalIdentifier: 'note-target-run',
  }),
  deletion('fieldMetadata', 'note-target-run', {
    name: 'targetWorkflowRun',
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: 'note-target-object',
    relationTargetFieldMetadataUniversalIdentifier: 'run-note-targets',
    relationTargetObjectMetadataUniversalIdentifier: 'run-object',
  }),
  deletion('view', 'run-view', {
    name: 'All runs',
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: 'run-object',
  }),
  deletion('viewField', 'run-view-created-at', {
    isSystemSideEffect: true,
    viewUniversalIdentifier: 'run-view',
    fieldMetadataUniversalIdentifier: 'run-created-at',
  }),
  deletion('fieldMetadata', 'workspace-segmentation', {
    name: 'segmentation',
    objectMetadataUniversalIdentifier: 'workspace-object',
  }),
  deletion('pageLayoutWidget', 'workspace-segmentation-widget', {
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: 'workspace-object',
    pageLayoutTabUniversalIdentifier: 'workspace-tab',
    universalConfiguration: {
      configurationType: 'FORM_FIELD',
      fieldMetadataId: 'workspace-segmentation',
    },
  }),
  deletion('view', 'old-view', { name: 'Old view' }),
];

const format = (actions: AppPlanAction[]) =>
  formatAppPlanActions({
    actions,
    summary: getAppPlanSummary(actions),
    inferDeletionFromMissingEntities: true,
  });

describe('formatAppPlanActions', () => {
  it('folds cascaded deletions into the deletion that causes them', () => {
    const output = format(ACTIONS);

    expect(output).toContain(
      '  # objectMetadata "workflowRun" will be destroyed',
    );
    expect(output).toContain(
      '  - also destroys 6 dependent entities: 4 fieldMetadata, 1 view, 1 viewField',
    );
    expect(output).toContain(
      '  # fieldMetadata "segmentation" will be destroyed',
    );
    expect(output).toContain(
      '  - also destroys 1 dependent entity: 1 pageLayoutWidget',
    );
    expect(output).toContain('  # view "Old view" will be destroyed');
    for (const cascaded of [
      '"workflowName"',
      '"createdAt"',
      '"noteTargets"',
      '"targetWorkflowRun"',
      '"All runs"',
    ]) {
      expect(output).not.toContain(`# fieldMetadata ${cascaded}`);
      expect(output).not.toContain(`# view ${cascaded}`);
    }
    expect(output).toContain('Plan: 0 to add, 0 to change, 10 to destroy.');
    expect(output).toContain(
      '7 of the 10 deletions cascade from the ones listed above.',
    );
  });

  it('warns once per dropped table or column, naming fields lost elsewhere', () => {
    const output = format(ACTIONS);

    expect(output).toContain(
      'Warning: 2 destructive change(s) will permanently delete data.',
    );
    expect(output).toContain(
      '  - objectMetadata "workflowRun": drops the table and all its rows, and 1 field on other objects',
    );
    expect(output).toContain(
      '  - fieldMetadata "segmentation": drops the column and its data',
    );
    expect(output).not.toContain('"createdAt": drops the column');
  });

  it('keeps a deleted relation field and its side-effect inverse as one deletion', () => {
    const output = format([
      deletion('fieldMetadata', 'company-people', {
        name: 'people',
        objectMetadataUniversalIdentifier: 'company-object',
        relationTargetFieldMetadataUniversalIdentifier: 'person-company',
      }),
      deletion('fieldMetadata', 'person-company', {
        name: 'company',
        isSystemSideEffect: true,
        objectMetadataUniversalIdentifier: 'person-object',
        relationTargetFieldMetadataUniversalIdentifier: 'company-people',
      }),
    ]);

    expect(output).toContain('  # fieldMetadata "people" will be destroyed');
    expect(output).not.toContain(
      '  # fieldMetadata "company" will be destroyed',
    );
    expect(output).toContain(
      '  - fieldMetadata "people": drops the column and its data, and 1 field on other objects',
    );
  });

  it('shows both fields of a relation deleted explicitly on each side', () => {
    const output = format([
      deletion('fieldMetadata', 'company-people', {
        name: 'people',
        relationTargetFieldMetadataUniversalIdentifier: 'person-company',
      }),
      deletion('fieldMetadata', 'person-company', {
        name: 'company',
        relationTargetFieldMetadataUniversalIdentifier: 'company-people',
      }),
    ]);

    expect(output).toContain('  # fieldMetadata "people" will be destroyed');
    expect(output).toContain('  # fieldMetadata "company" will be destroyed');
    expect(output).not.toContain('cascade');
  });
});

describe('getAppPlanSummary', () => {
  it('counts every deletion but only the independent ones as destructive', () => {
    expect(getAppPlanSummary(ACTIONS)).toEqual({
      create: 0,
      update: 0,
      delete: 10,
      destructive: 2,
      cascaded: 7,
    });
  });
});
