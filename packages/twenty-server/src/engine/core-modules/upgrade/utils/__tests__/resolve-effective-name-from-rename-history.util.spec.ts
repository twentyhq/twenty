import { resolveEffectiveNameFromRenameHistory } from 'src/engine/core-modules/upgrade/utils/resolve-effective-name-from-rename-history.util';

describe('resolveEffectiveNameFromRenameHistory', () => {
  const buildPredicate = (applied: string[]) => {
    const set = new Set(applied);

    return (stepName: string) => set.has(stepName);
  };

  it('should return the current name when history is empty', () => {
    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'currentTable',
        history: [],
        isStepApplied: buildPredicate([]),
      }),
    ).toBe('currentTable');
  });

  it('should return the previous name when the rename command has not been applied', () => {
    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'newName',
        history: [
          { previousName: 'oldName', upgradeCommandName: 'rename_cmd' },
        ],
        isStepApplied: buildPredicate([]),
      }),
    ).toBe('oldName');
  });

  it('should return the current name once the rename has been applied', () => {
    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'newName',
        history: [
          { previousName: 'oldName', upgradeCommandName: 'rename_cmd' },
        ],
        isStepApplied: buildPredicate(['rename_cmd']),
      }),
    ).toBe('newName');
  });

  it('should walk multi-step history and pick the first not-yet-applied entry', () => {
    const history = [
      { previousName: 'foo', upgradeCommandName: 'cmd1' },
      { previousName: 'bar', upgradeCommandName: 'cmd2' },
    ];

    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'baz',
        history,
        isStepApplied: buildPredicate([]),
      }),
    ).toBe('foo');

    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'baz',
        history,
        isStepApplied: buildPredicate(['cmd1']),
      }),
    ).toBe('bar');

    expect(
      resolveEffectiveNameFromRenameHistory({
        currentName: 'baz',
        history,
        isStepApplied: buildPredicate(['cmd1', 'cmd2']),
      }),
    ).toBe('baz');
  });
});
