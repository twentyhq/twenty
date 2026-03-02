import { ActionViewType } from 'twenty-shared/types';

import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { type ShouldBeRegisteredRulesLogic } from '@/action-menu/actions/types/ShouldBeRegisteredRulesLogic';
import { evaluateShouldBeRegisteredRule } from '@/action-menu/actions/utils/evaluateShouldBeRegisteredRule';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const mockRecord = (fields: Record<string, unknown> = {}): ObjectRecord => ({
  id: 'test-id',
  __typename: 'TestRecord',
  ...fields,
});

const baseParams: ShouldBeRegisteredFunctionParams = {
  objectPermissions: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  targetObjectReadPermissions: { workflow: true, person: true },
  targetObjectWritePermissions: { person: true },
  featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: false },
};

describe('evaluateShouldBeRegisteredRule', () => {
  it('returns true for null rule', () => {
    expect(evaluateShouldBeRegisteredRule(null, baseParams)).toBe(true);
  });

  it('returns true for undefined rule', () => {
    expect(evaluateShouldBeRegisteredRule(undefined, baseParams)).toBe(true);
  });

  it('returns the boolean for literal boolean rules', () => {
    expect(evaluateShouldBeRegisteredRule(true, baseParams)).toBe(true);
    expect(evaluateShouldBeRegisteredRule(false, baseParams)).toBe(false);
  });

  describe('null check (!== null) replacing isDefined', () => {
    const rule: ShouldBeRegisteredRulesLogic = {
      '!==': [{ var: 'selectedRecord' }, null],
    };

    it('returns true when value is defined', () => {
      const params = {
        ...baseParams,
        selectedRecord: mockRecord(),
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when value is undefined', () => {
      const params = {
        ...baseParams,
        selectedRecord: undefined,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false when value is null', () => {
      const params = {
        ...baseParams,
        selectedRecord: null,
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('non-empty string check (!== null && !== empty)', () => {
    const rule: ShouldBeRegisteredRulesLogic = {
      and: [
        { '!==': [{ var: 'selectedRecord.bodyV2.blocknote' }, null] },
        { '!==': [{ var: 'selectedRecord.bodyV2.blocknote' }, ''] },
      ],
    };

    it('returns true for non-empty string', () => {
      const params = {
        ...baseParams,
        selectedRecord: mockRecord({ bodyV2: { blocknote: 'content' } }),
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false for empty string', () => {
      const params = {
        ...baseParams,
        selectedRecord: mockRecord({ bodyV2: { blocknote: '' } }),
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false for null', () => {
      const params = {
        ...baseParams,
        selectedRecord: mockRecord({ bodyV2: { blocknote: null } }),
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('read permission via map access', () => {
    const rule: ShouldBeRegisteredRulesLogic = {
      var: 'targetObjectReadPermissions.workflow',
    };

    it('returns true when permission granted', () => {
      const params = {
        ...baseParams,
        targetObjectReadPermissions: { workflow: true },
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when permission denied', () => {
      const params = {
        ...baseParams,
        targetObjectReadPermissions: { workflow: false },
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('write permission via map access', () => {
    it('reads from targetObjectWritePermissions', () => {
      const rule: ShouldBeRegisteredRulesLogic = {
        var: 'targetObjectWritePermissions.person',
      };

      const denied = {
        ...baseParams,
        targetObjectWritePermissions: { person: false },
      };

      expect(evaluateShouldBeRegisteredRule(rule, denied)).toBe(false);

      const granted = {
        ...baseParams,
        targetObjectWritePermissions: { person: true },
      };

      expect(evaluateShouldBeRegisteredRule(rule, granted)).toBe(true);
    });
  });

  describe('feature flag via map access', () => {
    const rule: ShouldBeRegisteredRulesLogic = {
      var: 'featureFlags.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
    };

    it('returns true when flag enabled', () => {
      const params = {
        ...baseParams,
        featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: true },
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when flag disabled', () => {
      const params = {
        ...baseParams,
        featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: false },
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('complex rules - round-trip verification', () => {
    it('evaluates delete single record rule', () => {
      const rule: ShouldBeRegisteredRulesLogic = {
        and: [
          { '!==': [{ var: 'selectedRecord' }, null] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '===': [{ var: 'selectedRecord.deletedAt' }, null] },
        ],
      };

      const shouldShow = {
        ...baseParams,
        selectedRecord: mockRecord({ isRemote: false }),
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, shouldShow)).toBe(true);

      const deletedRecord = {
        ...baseParams,
        selectedRecord: mockRecord({
          isRemote: false,
          deletedAt: '2024-01-01',
        }),
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, deletedRecord)).toBe(false);

      const remoteRecord = {
        ...baseParams,
        selectedRecord: mockRecord({ isRemote: true }),
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, remoteRecord)).toBe(false);

      const noRecord = {
        ...baseParams,
        selectedRecord: undefined,
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, noRecord)).toBe(false);
    });

    it('evaluates navigate action rule', () => {
      const rule: ShouldBeRegisteredRulesLogic = {
        and: [
          { var: 'targetObjectReadPermissions.workflow' },
          {
            or: [
              {
                '!==': [{ var: 'objectMetadataItem.nameSingular' }, 'workflow'],
              },
              { '===': [{ var: 'viewType' }, ActionViewType.SHOW_PAGE] },
            ],
          },
        ],
      };

      const onDifferentObject = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'person' },
        viewType: ActionViewType.INDEX_PAGE_NO_SELECTION,
        targetObjectReadPermissions: { workflow: true },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, onDifferentObject)).toBe(
        true,
      );

      const onSameObjectShowPage = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'workflow' },
        viewType: ActionViewType.SHOW_PAGE,
        targetObjectReadPermissions: { workflow: true },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, onSameObjectShowPage)).toBe(
        true,
      );

      const onSameObjectIndexPage = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'workflow' },
        viewType: ActionViewType.INDEX_PAGE_NO_SELECTION,
        targetObjectReadPermissions: { workflow: true },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, onSameObjectIndexPage)).toBe(
        false,
      );

      const noPermission = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'person' },
        viewType: ActionViewType.INDEX_PAGE_NO_SELECTION,
        targetObjectReadPermissions: { workflow: false },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, noPermission)).toBe(false);
    });

    it('evaluates if/then/else rule (workflow stop)', () => {
      const rule: ShouldBeRegisteredRulesLogic = {
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
      };

      const selectAll = {
        ...baseParams,
        isSelectAll: true,
      };

      expect(evaluateShouldBeRegisteredRule(rule, selectAll)).toBe(true);

      const runningRecord = {
        ...baseParams,
        isSelectAll: false,
        selectedRecord: mockRecord({ status: 'RUNNING' }),
      };

      expect(evaluateShouldBeRegisteredRule(rule, runningRecord)).toBe(true);

      const completedRecord = {
        ...baseParams,
        isSelectAll: false,
        selectedRecord: mockRecord({ status: 'COMPLETED' }),
      };

      expect(evaluateShouldBeRegisteredRule(rule, completedRecord)).toBe(false);
    });

    it('evaluates feature flag + permissions rule', () => {
      const rule: ShouldBeRegisteredRulesLogic = {
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
      };

      const allConditionsMet = {
        ...baseParams,
        featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: true },
        selectedRecord: mockRecord({ isRemote: false }),
        objectMetadataItem: { nameSingular: 'person' },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, allConditionsMet)).toBe(true);

      const flagDisabled = {
        ...baseParams,
        featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: false },
        selectedRecord: mockRecord({ isRemote: false }),
        objectMetadataItem: { nameSingular: 'person' },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, flagDisabled)).toBe(false);

      const isDashboard = {
        ...baseParams,
        featureFlags: { IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: true },
        selectedRecord: mockRecord({ isRemote: false }),
        objectMetadataItem: { nameSingular: 'dashboard' },
      } as unknown as ShouldBeRegisteredFunctionParams;

      expect(evaluateShouldBeRegisteredRule(rule, isDashboard)).toBe(false);
    });
  });
});
