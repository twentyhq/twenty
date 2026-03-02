import { Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { convertArrowFunctionToJsonLogic } from '../utils/convert-arrow-function-to-json-logic';

const convert = (arrowFnSource: string): unknown => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    'temp.ts',
    `const fn = ${arrowFnSource};`,
  );
  const arrowFunctions = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  return convertArrowFunctionToJsonLogic({ node: arrowFunctions[0] });
};

describe('convertShouldBeRegisteredToJsonLogic', () => {
  describe('Tier 1 - Trivial patterns', () => {
    it('converts () => true', () => {
      expect(convert('() => true')).toBe(true);
    });

    it('converts () => false', () => {
      expect(convert('() => false')).toBe(false);
    });

    it('converts simple negation', () => {
      expect(convert('({ isInRightDrawer }) => !isInRightDrawer')).toEqual({
        '!': [{ var: 'isInRightDrawer' }],
      });
    });

    it('converts simple param check', () => {
      expect(
        convert(
          '({ hasAnySoftDeleteFilterOnView }) => !hasAnySoftDeleteFilterOnView',
        ),
      ).toEqual({
        '!': [{ var: 'hasAnySoftDeleteFilterOnView' }],
      });
    });
  });

  describe('Tier 2 - Null checks and property access', () => {
    it('converts !== null check', () => {
      expect(
        convert('({ selectedRecord }) => selectedRecord !== null'),
      ).toEqual({
        '!==': [{ var: 'selectedRecord' }, null],
      });
    });

    it('converts === null check (negated defined)', () => {
      expect(
        convert(
          '({ selectedRecord }) => selectedRecord?.deletedAt === null',
        ),
      ).toEqual({
        '===': [{ var: 'selectedRecord.deletedAt' }, null],
      });
    });

    it('converts AND chain with null checks and permissions', () => {
      const result = convert(
        `({ selectedRecord, hasAnySoftDeleteFilterOnView, objectPermissions }) =>
        (selectedRecord !== null &&
          !selectedRecord.isRemote &&
          !hasAnySoftDeleteFilterOnView &&
          objectPermissions.canSoftDeleteObjectRecords &&
          selectedRecord?.deletedAt === null) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { '!==': [{ var: 'selectedRecord' }, null] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '===': [{ var: 'selectedRecord.deletedAt' }, null] },
        ],
      });
    });

    it('converts permission + soft delete check', () => {
      const result = convert(
        `({ objectPermissions, hasAnySoftDeleteFilterOnView }) =>
        (objectPermissions.canUpdateObjectRecords &&
          !hasAnySoftDeleteFilterOnView) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { var: 'objectPermissions.canUpdateObjectRecords' },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
        ],
      });
    });

    it('converts comparison with constant', () => {
      const result = convert(
        `({ objectPermissions, isRemote, hasAnySoftDeleteFilterOnView, numberOfSelectedRecords }) =>
        (objectPermissions.canSoftDeleteObjectRecords &&
          !isRemote &&
          !hasAnySoftDeleteFilterOnView &&
          numberOfSelectedRecords !== null &&
          numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '!': [{ var: 'isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { '!==': [{ var: 'numberOfSelectedRecords' }, null] },
          { '<': [{ var: 'numberOfSelectedRecords' }, 10000] },
        ],
      });
    });

    it('converts favorite checks', () => {
      const result = convert(
        `({ selectedRecord, isFavorite, hasAnySoftDeleteFilterOnView }) =>
        !selectedRecord?.isRemote &&
        !isFavorite &&
        selectedRecord?.deletedAt === null &&
        !hasAnySoftDeleteFilterOnView`,
      );

      expect(result).toEqual({
        and: [
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'isFavorite' }] },
          { '===': [{ var: 'selectedRecord.deletedAt' }, null] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
        ],
      });
    });

    it('converts non-empty string check with null and empty comparisons', () => {
      const result = convert(
        `({ selectedRecord, isNoteOrTask }) =>
        isNoteOrTask !== null &&
        isNoteOrTask &&
        selectedRecord?.bodyV2?.blocknote !== null &&
        selectedRecord?.bodyV2?.blocknote !== ''`,
      );

      expect(result).toEqual({
        and: [
          { '!==': [{ var: 'isNoteOrTask' }, null] },
          { var: 'isNoteOrTask' },
          { '!==': [{ var: 'selectedRecord.bodyV2.blocknote' }, null] },
          { '!==': [{ var: 'selectedRecord.bodyV2.blocknote' }, ''] },
        ],
      });
    });

    it('converts null check with AND check', () => {
      const result = convert(
        `({ hasAnySoftDeleteFilterOnView }) =>
        hasAnySoftDeleteFilterOnView !== null && hasAnySoftDeleteFilterOnView`,
      );

      expect(result).toEqual({
        and: [
          { '!==': [{ var: 'hasAnySoftDeleteFilterOnView' }, null] },
          { var: 'hasAnySoftDeleteFilterOnView' },
        ],
      });
    });

    it('converts merge records pattern', () => {
      const result = convert(
        `({ objectMetadataItem, numberOfSelectedRecords, objectPermissions }) =>
        objectMetadataItem?.duplicateCriteria !== null &&
        numberOfSelectedRecords !== null &&
        objectPermissions.canUpdateObjectRecords &&
        objectPermissions.canDestroyObjectRecords &&
        numberOfSelectedRecords <= MUTATION_MAX_MERGE_RECORDS`,
      );

      expect(result).toEqual({
        and: [
          { '!==': [{ var: 'objectMetadataItem.duplicateCriteria' }, null] },
          { '!==': [{ var: 'numberOfSelectedRecords' }, null] },
          { var: 'objectPermissions.canUpdateObjectRecords' },
          { var: 'objectPermissions.canDestroyObjectRecords' },
          { '<=': [{ var: 'numberOfSelectedRecords' }, 9] },
        ],
      });
    });
  });

  describe('Tier 3 - Map access and complex patterns', () => {
    it('converts targetObjectReadPermissions map access', () => {
      const result = convert(
        `({ objectMetadataItem, viewType, targetObjectReadPermissions }) =>
        targetObjectReadPermissions.workflow &&
        (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Workflow ||
          viewType === ActionViewType.SHOW_PAGE)`,
      );

      expect(result).toEqual({
        and: [
          { var: 'targetObjectReadPermissions.workflow' },
          {
            or: [
              {
                '!==': [{ var: 'objectMetadataItem.nameSingular' }, 'workflow'],
              },
              { '===': [{ var: 'viewType' }, 'SHOW_PAGE'] },
            ],
          },
        ],
      });
    });

    it('converts featureFlags map access', () => {
      const result = convert(
        `({ selectedRecord, objectPermissions, objectMetadataItem, featureFlags }) =>
        featureFlags.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED &&
        selectedRecord !== null &&
        !selectedRecord?.isRemote &&
        selectedRecord?.deletedAt === null &&
        objectPermissions.canUpdateObjectRecords &&
        objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Dashboard`,
      );

      expect(result).toEqual({
        and: [
          { var: 'featureFlags.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED' },
          { '!==': [{ var: 'selectedRecord' }, null] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '===': [{ var: 'selectedRecord.deletedAt' }, null] },
          { var: 'objectPermissions.canUpdateObjectRecords' },
          {
            '!==': [{ var: 'objectMetadataItem.nameSingular' }, 'dashboard'],
          },
        ],
      });
    });

    it('converts restore pattern with OR subgroup', () => {
      const result = convert(
        `({ selectedRecord, objectPermissions, isRemote, isShowPage, hasAnySoftDeleteFilterOnView }) =>
        (!isRemote &&
          selectedRecord?.deletedAt !== null &&
          objectPermissions.canSoftDeleteObjectRecords &&
          ((isShowPage !== null && isShowPage) ||
            (hasAnySoftDeleteFilterOnView !== null &&
              hasAnySoftDeleteFilterOnView))) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { '!': [{ var: 'isRemote' }] },
          { '!==': [{ var: 'selectedRecord.deletedAt' }, null] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          {
            or: [
              {
                and: [
                  { '!==': [{ var: 'isShowPage' }, null] },
                  { var: 'isShowPage' },
                ],
              },
              {
                and: [
                  { '!==': [{ var: 'hasAnySoftDeleteFilterOnView' }, null] },
                  { var: 'hasAnySoftDeleteFilterOnView' },
                ],
              },
            ],
          },
        ],
      });
    });

    it('converts workflow version status check', () => {
      const result = convert(
        `({ selectedRecord }) =>
        selectedRecord !== null && selectedRecord.status !== 'DRAFT'`,
      );

      expect(result).toEqual({
        and: [
          { '!==': [{ var: 'selectedRecord' }, null] },
          { '!==': [{ var: 'selectedRecord.status' }, 'DRAFT'] },
        ],
      });
    });

    it('converts nested property access through optional chain', () => {
      const result = convert(
        '({ selectedRecord }) => selectedRecord?.workflow?.id !== null',
      );

      expect(result).toEqual({
        '!==': [{ var: 'selectedRecord.workflow.id' }, null],
      });
    });

    it('converts block body with if/return', () => {
      const result = convert(
        `({ selectedRecord, isSelectAll }) => {
        if (isSelectAll === true) {
          return true;
        }
        const stoppableStatuses = ['NOT_STARTED', 'ENQUEUED', 'RUNNING'];
        return stoppableStatuses.includes(selectedRecord?.status);
      }`,
      );

      expect(result).toEqual({
        if: [
          { '===': [{ var: 'isSelectAll' }, true] },
          true,
          {
            in: [
              { var: 'selectedRecord.status' },
              ['NOT_STARTED', 'ENQUEUED', 'RUNNING'],
            ],
          },
        ],
      });
    });

    it('converts || false pattern by stripping it', () => {
      const result = convert(
        `({ workflowWithCurrentVersion, selectedRecord }) =>
        (workflowWithCurrentVersion?.statuses?.includes('ACTIVE') || false) &&
        (workflowWithCurrentVersion?.statuses?.includes('DRAFT') || false) &&
        selectedRecord?.deletedAt === null`,
      );

      expect(result).toEqual({
        and: [
          {
            in: ['ACTIVE', { var: 'workflowWithCurrentVersion.statuses' }],
          },
          {
            in: ['DRAFT', { var: 'workflowWithCurrentVersion.statuses' }],
          },
          { '===': [{ var: 'selectedRecord.deletedAt' }, null] },
        ],
      });
    });
  });
});
