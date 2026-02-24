import { type RulesLogic } from 'json-logic-js';

import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { evaluateShouldBeRegisteredRule } from '@/action-menu/actions/utils/evaluateShouldBeRegisteredRule';

const baseParams: ShouldBeRegisteredFunctionParams = {
  objectPermissions: {
    canRead: true,
    canUpdate: true,
    canSoftDelete: true,
    canDestroy: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
  } as ShouldBeRegisteredFunctionParams['objectPermissions'],
  getTargetObjectReadPermission: () => true,
  getTargetObjectWritePermission: () => true,
  isFeatureFlagEnabled: () => false,
  forceRegisteredActionsByKey: {},
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

  describe('isDefined custom operator', () => {
    const rule: RulesLogic = { isDefined: [{ var: 'selectedRecord' }] };

    it('returns true when value is defined', () => {
      const params = { ...baseParams, selectedRecord: { id: '1' } as any };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when value is undefined', () => {
      const params = { ...baseParams, selectedRecord: undefined };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false when value is null', () => {
      const params = { ...baseParams, selectedRecord: null as any };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('isNonEmptyString custom operator', () => {
    const rule: RulesLogic = {
      isNonEmptyString: [{ var: 'selectedRecord.bodyV2.blocknote' }],
    } as RulesLogic;

    it('returns true for non-empty string', () => {
      const params = {
        ...baseParams,
        selectedRecord: { bodyV2: { blocknote: 'content' } } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false for empty string', () => {
      const params = {
        ...baseParams,
        selectedRecord: { bodyV2: { blocknote: '' } } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false for null', () => {
      const params = {
        ...baseParams,
        selectedRecord: { bodyV2: { blocknote: null } } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('hasReadPermission custom operator', () => {
    const rule: RulesLogic = {
      hasReadPermission: ['workflow'],
    } as RulesLogic;

    it('returns true when permission granted', () => {
      const params = {
        ...baseParams,
        getTargetObjectReadPermission: () => true,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when permission denied', () => {
      const params = {
        ...baseParams,
        getTargetObjectReadPermission: () => false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('passes the object name to the callback', () => {
      const mockFn = jest.fn().mockReturnValue(true);
      const params = {
        ...baseParams,
        getTargetObjectReadPermission: mockFn,
      };

      evaluateShouldBeRegisteredRule(rule, params);
      expect(mockFn).toHaveBeenCalledWith('workflow');
    });
  });

  describe('hasWritePermission custom operator', () => {
    it('delegates to getTargetObjectWritePermission', () => {
      const rule: RulesLogic = {
        hasWritePermission: ['person'],
      } as RulesLogic;
      const mockFn = jest.fn().mockReturnValue(false);
      const params = {
        ...baseParams,
        getTargetObjectWritePermission: mockFn,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
      expect(mockFn).toHaveBeenCalledWith('person');
    });
  });

  describe('isFeatureFlagEnabled custom operator', () => {
    const rule: RulesLogic = {
      isFeatureFlagEnabled: ['IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED'],
    } as RulesLogic;

    it('returns true when flag enabled', () => {
      const params = {
        ...baseParams,
        isFeatureFlagEnabled: () => true,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when flag disabled', () => {
      const params = {
        ...baseParams,
        isFeatureFlagEnabled: () => false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('areWorkflowTriggerAndStepsDefined custom operator', () => {
    const rule: RulesLogic = {
      areWorkflowTriggerAndStepsDefined: [],
    } as RulesLogic;

    it('returns true when trigger and steps defined', () => {
      const params = {
        ...baseParams,
        workflowWithCurrentVersion: {
          currentVersion: {
            trigger: { type: 'MANUAL' },
            steps: [{ id: 'step1' }],
          },
        } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(true);
    });

    it('returns false when no trigger', () => {
      const params = {
        ...baseParams,
        workflowWithCurrentVersion: {
          currentVersion: {
            trigger: null,
            steps: [{ id: 'step1' }],
          },
        } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false when no steps', () => {
      const params = {
        ...baseParams,
        workflowWithCurrentVersion: {
          currentVersion: {
            trigger: { type: 'MANUAL' },
            steps: [],
          },
        } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });

    it('returns false when workflow undefined', () => {
      const params = {
        ...baseParams,
        workflowWithCurrentVersion: undefined,
      };

      expect(evaluateShouldBeRegisteredRule(rule, params)).toBe(false);
    });
  });

  describe('complex rules - round-trip verification', () => {
    it('evaluates delete single record rule', () => {
      const rule: RulesLogic = {
        and: [
          { isDefined: [{ var: 'selectedRecord' }] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ var: 'hasAnySoftDeleteFilterOnView' }] },
          { var: 'objectPermissions.canSoftDeleteObjectRecords' },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
        ],
      } as RulesLogic;

      const shouldShow = {
        ...baseParams,
        selectedRecord: { id: '1', isRemote: false } as any,
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, shouldShow)).toBe(true);

      const deletedRecord = {
        ...baseParams,
        selectedRecord: {
          id: '1',
          isRemote: false,
          deletedAt: '2024-01-01',
        } as any,
        hasAnySoftDeleteFilterOnView: false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, deletedRecord)).toBe(false);

      const remoteRecord = {
        ...baseParams,
        selectedRecord: { id: '1', isRemote: true } as any,
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
      const rule: RulesLogic = {
        and: [
          { hasReadPermission: ['workflow'] },
          {
            or: [
              {
                '!==': [
                  { var: 'objectMetadataItem.nameSingular' },
                  'workflow',
                ],
              },
              { '===': [{ var: 'viewType' }, 'SHOW_PAGE'] },
            ],
          },
        ],
      } as RulesLogic;

      const onDifferentObject = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'person' } as any,
        viewType: 'INDEX_PAGE_NO_SELECTION' as any,
        getTargetObjectReadPermission: () => true,
      };

      expect(evaluateShouldBeRegisteredRule(rule, onDifferentObject)).toBe(
        true,
      );

      const onSameObjectShowPage = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'workflow' } as any,
        viewType: 'SHOW_PAGE' as any,
        getTargetObjectReadPermission: () => true,
      };

      expect(
        evaluateShouldBeRegisteredRule(rule, onSameObjectShowPage),
      ).toBe(true);

      const onSameObjectIndexPage = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'workflow' } as any,
        viewType: 'INDEX_PAGE_NO_SELECTION' as any,
        getTargetObjectReadPermission: () => true,
      };

      expect(
        evaluateShouldBeRegisteredRule(rule, onSameObjectIndexPage),
      ).toBe(false);

      const noPermission = {
        ...baseParams,
        objectMetadataItem: { nameSingular: 'person' } as any,
        viewType: 'INDEX_PAGE_NO_SELECTION' as any,
        getTargetObjectReadPermission: () => false,
      };

      expect(evaluateShouldBeRegisteredRule(rule, noPermission)).toBe(false);
    });

    it('evaluates if/then/else rule (workflow stop)', () => {
      const rule: RulesLogic = {
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
      } as RulesLogic;

      const selectAll = {
        ...baseParams,
        isSelectAll: true,
      };

      expect(evaluateShouldBeRegisteredRule(rule, selectAll)).toBe(true);

      const runningRecord = {
        ...baseParams,
        isSelectAll: false,
        selectedRecord: { status: 'RUNNING' } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, runningRecord)).toBe(true);

      const completedRecord = {
        ...baseParams,
        isSelectAll: false,
        selectedRecord: { status: 'COMPLETED' } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, completedRecord)).toBe(
        false,
      );
    });

    it('evaluates feature flag + permissions rule', () => {
      const rule: RulesLogic = {
        and: [
          { isFeatureFlagEnabled: ['IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED'] },
          { isDefined: [{ var: 'selectedRecord' }] },
          { '!': [{ var: 'selectedRecord.isRemote' }] },
          { '!': [{ isDefined: [{ var: 'selectedRecord.deletedAt' }] }] },
          { var: 'objectPermissions.canUpdateObjectRecords' },
          {
            '!==': [
              { var: 'objectMetadataItem.nameSingular' },
              'dashboard',
            ],
          },
        ],
      } as RulesLogic;

      const allConditionsMet = {
        ...baseParams,
        isFeatureFlagEnabled: () => true,
        selectedRecord: { id: '1', isRemote: false } as any,
        objectMetadataItem: { nameSingular: 'person' } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, allConditionsMet)).toBe(
        true,
      );

      const flagDisabled = {
        ...baseParams,
        isFeatureFlagEnabled: () => false,
        selectedRecord: { id: '1', isRemote: false } as any,
        objectMetadataItem: { nameSingular: 'person' } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, flagDisabled)).toBe(false);

      const isDashboard = {
        ...baseParams,
        isFeatureFlagEnabled: () => true,
        selectedRecord: { id: '1', isRemote: false } as any,
        objectMetadataItem: { nameSingular: 'dashboard' } as any,
      };

      expect(evaluateShouldBeRegisteredRule(rule, isDashboard)).toBe(false);
    });
  });
});
