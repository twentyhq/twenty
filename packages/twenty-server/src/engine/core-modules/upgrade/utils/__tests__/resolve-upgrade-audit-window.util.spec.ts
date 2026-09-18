import {
  isStepInUpgradeAuditWindow,
  resolveUpgradeAuditWindow,
} from 'src/engine/core-modules/upgrade/utils/resolve-upgrade-audit-window.util';

const STEP_NAMES = [
  '2.39.0_AddColumnFastInstanceCommand_1',
  '2.39.0_BackfillCommand_2',
  '2.40.0_AddOtherColumnFastInstanceCommand_3',
  '2.40.0_SyncRecordShareObjectCommand_4',
  '2.40.0_ReconcileStandardSkillsCommand_5',
  '2.41.0_SeedObjectInitialViewCommand_6',
];

describe('resolveUpgradeAuditWindow', () => {
  it('returns null when the cursor is not part of the sequence', () => {
    expect(
      resolveUpgradeAuditWindow({
        stepNames: STEP_NAMES,
        cursorName: '2.12.0_LongGoneCommand_0',
      }),
    ).toBeNull();
  });

  it('opens the window on the whole sequence preceding the cursor', () => {
    expect(
      resolveUpgradeAuditWindow({
        stepNames: STEP_NAMES,
        cursorName: '2.41.0_SeedObjectInitialViewCommand_6',
      }),
    ).toEqual({ cursorIndex: 5, baselineIndex: -1 });
  });

  it('moves the baseline to the furthest initial command', () => {
    expect(
      resolveUpgradeAuditWindow({
        stepNames: STEP_NAMES,
        cursorName: '2.41.0_SeedObjectInitialViewCommand_6',
        baselineNames: [
          '2.39.0_BackfillCommand_2',
          '2.40.0_ReconcileStandardSkillsCommand_5',
        ],
      }),
    ).toEqual({ cursorIndex: 5, baselineIndex: 4 });
  });

  it('ignores a baseline that is not part of the sequence', () => {
    expect(
      resolveUpgradeAuditWindow({
        stepNames: STEP_NAMES,
        cursorName: '2.40.0_ReconcileStandardSkillsCommand_5',
        baselineNames: ['2.12.0_LongGoneCommand_0'],
      }),
    ).toEqual({ cursorIndex: 4, baselineIndex: -1 });
  });
});

describe('isStepInUpgradeAuditWindow', () => {
  const window = { cursorIndex: 5, baselineIndex: 1 };

  it.each([
    { stepIndex: 1, expected: false },
    { stepIndex: 2, expected: true },
    { stepIndex: 4, expected: true },
    { stepIndex: 5, expected: false },
    { stepIndex: 6, expected: false },
  ])(
    'returns $expected for a step at index $stepIndex',
    ({ stepIndex, expected }) => {
      expect(isStepInUpgradeAuditWindow({ stepIndex, window })).toBe(expected);
    },
  );
});
