import { isDefined } from 'twenty-shared/utils';
import { describe, expect, it } from 'vitest';

import { formatAppPlanActions } from '@/app/deployment/format-app-plan';
import { getAppPlanSummary } from '@/app/deployment/get-app-plan-summary';
import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';

const deletion = ({
  metadataName,
  universalIdentifier,
  cascadedFromUniversalIdentifier,
  flatEntity = {},
}: {
  metadataName: string;
  universalIdentifier: string;
  cascadedFromUniversalIdentifier?: string;
  flatEntity?: Record<string, unknown>;
}): AppPlanAction => ({
  type: 'delete',
  metadataName,
  universalIdentifier,
  flatEntity,
  ...(isDefined(cascadedFromUniversalIdentifier) && {
    cascadedFromUniversalIdentifier,
  }),
});

const ACTIONS: AppPlanAction[] = [
  deletion({
    metadataName: 'objectMetadata',
    universalIdentifier: 'run-object',
    flatEntity: { nameSingular: 'workflowRun' },
  }),
  deletion({
    metadataName: 'fieldMetadata',
    universalIdentifier: 'run-name',
    cascadedFromUniversalIdentifier: 'run-object',
    flatEntity: {
      name: 'workflowName',
      objectMetadataUniversalIdentifier: 'run-object',
    },
  }),
  deletion({
    metadataName: 'fieldMetadata',
    universalIdentifier: 'run-created-at',
    cascadedFromUniversalIdentifier: 'run-object',
    flatEntity: {
      name: 'createdAt',
      objectMetadataUniversalIdentifier: 'run-object',
    },
  }),
  deletion({
    metadataName: 'fieldMetadata',
    universalIdentifier: 'note-target-run',
    cascadedFromUniversalIdentifier: 'run-object',
    flatEntity: {
      name: 'targetWorkflowRun',
      objectMetadataUniversalIdentifier: 'note-target-object',
    },
  }),
  deletion({
    metadataName: 'view',
    universalIdentifier: 'run-view',
    cascadedFromUniversalIdentifier: 'run-object',
    flatEntity: { name: 'All runs' },
  }),
  deletion({
    metadataName: 'viewField',
    universalIdentifier: 'run-view-created-at',
    cascadedFromUniversalIdentifier: 'run-object',
  }),
  deletion({
    metadataName: 'fieldMetadata',
    universalIdentifier: 'workspace-segmentation',
    flatEntity: {
      name: 'segmentation',
      objectMetadataUniversalIdentifier: 'workspace-object',
    },
  }),
  deletion({
    metadataName: 'pageLayoutWidget',
    universalIdentifier: 'workspace-segmentation-widget',
    cascadedFromUniversalIdentifier: 'workspace-segmentation',
  }),
  deletion({
    metadataName: 'view',
    universalIdentifier: 'old-view',
    flatEntity: { name: 'Old view' },
  }),
];

const format = (actions: AppPlanAction[]) =>
  formatAppPlanActions({
    actions,
    summary: getAppPlanSummary(actions),
    inferDeletionFromMissingEntities: true,
  });

describe('formatAppPlanActions', () => {
  it('folds cascaded deletions into the deletion the server names as their cause', () => {
    const output = format(ACTIONS);

    expect(output).toContain(
      '  # objectMetadata "workflowRun" will be destroyed',
    );
    expect(output).toContain(
      '  - also destroys 5 dependent entities: 3 fieldMetadata, 1 view, 1 viewField',
    );
    expect(output).toContain(
      '  # fieldMetadata "segmentation" will be destroyed',
    );
    expect(output).toContain(
      '  - also destroys 1 dependent entity: 1 pageLayoutWidget',
    );
    expect(output).toContain('  # view "Old view" will be destroyed');
    for (const cascaded of [
      'fieldMetadata "workflowName"',
      'fieldMetadata "createdAt"',
      'fieldMetadata "targetWorkflowRun"',
      'view "All runs"',
    ]) {
      expect(output).not.toContain(`# ${cascaded}`);
    }
    expect(output).toContain('Plan: 0 to add, 0 to change, 9 to destroy.');
    expect(output).toContain(
      '6 of the 9 deletions cascade from the ones listed above.',
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

  it('lists every deletion when the server does not annotate cascades', () => {
    const output = format(
      ACTIONS.map(
        ({ cascadedFromUniversalIdentifier: _cascade, ...action }) => action,
      ),
    );

    expect(output).toContain('  # fieldMetadata "createdAt" will be destroyed');
    expect(output).toContain('  # view "All runs" will be destroyed');
    expect(output).not.toContain('cascade');
  });

  it('lists a deletion whose named cause is not in the plan', () => {
    const output = format([
      deletion({
        metadataName: 'view',
        universalIdentifier: 'orphan-view',
        cascadedFromUniversalIdentifier: 'missing-object',
        flatEntity: { name: 'Orphan view' },
      }),
    ]);

    expect(output).toContain('  # view "Orphan view" will be destroyed');
    expect(output).not.toContain('cascade');
  });
});

describe('getAppPlanSummary', () => {
  it('counts every deletion but only the independent ones as destructive', () => {
    expect(getAppPlanSummary(ACTIONS)).toEqual({
      create: 0,
      update: 0,
      delete: 9,
      destructive: 2,
      cascaded: 6,
    });
  });
});
