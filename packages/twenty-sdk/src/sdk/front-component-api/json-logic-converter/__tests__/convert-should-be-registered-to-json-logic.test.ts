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

  describe('Tier 2 - isDefined and property access', () => {
    it('converts isDefined with param', () => {
      expect(
        convert('({ selectedRecord }) => isDefined(selectedRecord)'),
      ).toEqual({
        isDefined: [{ var: 'selectedRecord' }],
      });
    });

    it('converts !isDefined', () => {
      expect(
        convert(
          '({ selectedRecord }) => !isDefined(selectedRecord?.deletedAt)',
        ),
      ).toEqual({
        '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }],
      });
    });

    it('converts AND chain with isDefined and permissions', () => {
      const result = convert(
        `({ selectedRecord, hasAnySoftDeleteFilterOnView, objectPermissions }) =>
        (isDefined(selectedRecord) &&
          !selectedRecord.isRemote &&
          !hasAnySoftDeleteFilterOnView &&
          objectPermissions.canSoftDeleteObjectRecords &&
          !isDefined(selectedRecord?.deletedAt)) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { isDefined: [{ var: 'selectedRecord' }] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
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
          isDefined(numberOfSelectedRecords) &&
          numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '!': [{ var: 'isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { isDefined: [{ var: 'numberOfSelectedRecords' }] },
          { '<': [{ var: 'numberOfSelectedRecords' }, 10000] },
        ],
      });
    });

    it('converts favorite checks', () => {
      const result = convert(
        `({ selectedRecord, isFavorite, hasAnySoftDeleteFilterOnView }) =>
        !selectedRecord?.isRemote &&
        !isFavorite &&
        !isDefined(selectedRecord?.deletedAt) &&
        !hasAnySoftDeleteFilterOnView`,
      );

      expect(result).toEqual({
        and: [
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'isFavorite' }] },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
        ],
      });
    });

    it('converts isNonEmptyString', () => {
      const result = convert(
        `({ selectedRecord, isNoteOrTask }) =>
        isDefined(isNoteOrTask) &&
        isNoteOrTask &&
        isNonEmptyString(selectedRecord?.bodyV2?.blocknote)`,
      );

      expect(result).toEqual({
        and: [
          { isDefined: [{ var: 'isNoteOrTask' }] },
          { var: 'isNoteOrTask' },
          { isNonEmptyString: [{ var: 'selectedRecord.bodyV2.blocknote' }] },
        ],
      });
    });

    it('converts isDefined with hasAnySoftDeleteFilterOnView AND check', () => {
      const result = convert(
        `({ hasAnySoftDeleteFilterOnView }) =>
        isDefined(hasAnySoftDeleteFilterOnView) && hasAnySoftDeleteFilterOnView`,
      );

      expect(result).toEqual({
        and: [
          { isDefined: [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { var: 'hasAnySoftDeleteFilterOnView' },
        ],
      });
    });

    it('converts merge records pattern', () => {
      const result = convert(
        `({ objectMetadataItem, numberOfSelectedRecords, objectPermissions }) =>
        isDefined(objectMetadataItem?.duplicateCriteria) &&
        isDefined(numberOfSelectedRecords) &&
        Boolean(objectPermissions.canUpdateObjectRecords) &&
        Boolean(objectPermissions.canDestroyObjectRecords) &&
        numberOfSelectedRecords <= MUTATION_MAX_MERGE_RECORDS`,
      );

      expect(result).toEqual({
        and: [
          { isDefined: [{ var: 'objectMetadataItem.duplicateCriteria' }] },
          { isDefined: [{ var: 'numberOfSelectedRecords' }] },
          { '!!': [{ var: 'objectPermissions.canUpdateObjectRecords' }] },
          { '!!': [{ var: 'objectPermissions.canDestroyObjectRecords' }] },
          { '<=': [{ var: 'numberOfSelectedRecords' }, 9] },
        ],
      });
    });
  });

  describe('Tier 3 - Function calls and complex patterns', () => {
    it('converts getTargetObjectReadPermission', () => {
      const result = convert(
        `({ objectMetadataItem, viewType, getTargetObjectReadPermission }) =>
        getTargetObjectReadPermission(CoreObjectNameSingular.Workflow) &&
        (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Workflow ||
          viewType === ActionViewType.SHOW_PAGE)`,
      );

      expect(result).toEqual({
        and: [
          { hasReadPermission: ['workflow'] },
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

    it('converts isFeatureFlagEnabled', () => {
      const result = convert(
        `({ selectedRecord, objectPermissions, objectMetadataItem, isFeatureFlagEnabled }) =>
        isFeatureFlagEnabled(
          FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
        ) &&
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canUpdateObjectRecords &&
        objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Dashboard`,
      );

      expect(result).toEqual({
        and: [
          { isFeatureFlagEnabled: ['IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED'] },
          { isDefined: [{ var: 'selectedRecord' }] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
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
          isDefined(selectedRecord?.deletedAt) &&
          objectPermissions.canSoftDeleteObjectRecords &&
          ((isDefined(isShowPage) && isShowPage) ||
            (isDefined(hasAnySoftDeleteFilterOnView) &&
              hasAnySoftDeleteFilterOnView))) ??
        false`,
      );

      expect(result).toEqual({
        and: [
          { '!': [{ var: 'isRemote' }] },
          { isDefined: [{ var: 'selectedRecord.deletedAt' }] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          {
            or: [
              {
                and: [
                  { isDefined: [{ var: 'isShowPage' }] },
                  { var: 'isShowPage' },
                ],
              },
              {
                and: [
                  {
                    isDefined: [{ var: 'hasAnySoftDeleteFilterOnView' }],
                  },
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
        isDefined(selectedRecord) && selectedRecord.status !== 'DRAFT'`,
      );

      expect(result).toEqual({
        and: [
          { isDefined: [{ var: 'selectedRecord' }] },
          { '!==': [{ var: 'selectedRecord.status' }, 'DRAFT'] },
        ],
      });
    });

    it('converts nested property access through optional chain', () => {
      const result = convert(
        '({ selectedRecord }) => isDefined(selectedRecord?.workflow?.id)',
      );

      expect(result).toEqual({
        isDefined: [{ var: 'selectedRecord.workflow.id' }],
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
        !isDefined(selectedRecord?.deletedAt)`,
      );

      expect(result).toEqual({
        and: [
          {
            in: ['ACTIVE', { var: 'workflowWithCurrentVersion.statuses' }],
          },
          {
            in: ['DRAFT', { var: 'workflowWithCurrentVersion.statuses' }],
          },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
        ],
      });
    });
  });
});
