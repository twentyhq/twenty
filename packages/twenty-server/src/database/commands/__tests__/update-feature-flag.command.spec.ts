import { Logger } from '@nestjs/common';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { UpdateFeatureFlagCommand } from 'src/database/commands/update-feature-flag.command';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

describe('UpdateFeatureFlagCommand', () => {
  const featureFlagKey = Object.values(FeatureFlagKey)[0];
  const upsertWorkspaceFeatureFlag = jest.fn();

  const command = new UpdateFeatureFlagCommand(
    {} as WorkspaceIteratorService,
    { upsertWorkspaceFeatureFlag } as unknown as FeatureFlagService,
  );

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    upsertWorkspaceFeatureFlag.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects unknown feature flag keys', () => {
    expect(() => command.parseFlag('NOT_A_FLAG')).toThrow();
    expect(command.parseFlag(featureFlagKey)).toBe(featureFlagKey);
  });

  it('only accepts true or false as value', () => {
    expect(command.parseValue('true')).toBe(true);
    expect(command.parseValue('false')).toBe(false);
    expect(() => command.parseValue('yes')).toThrow();
  });

  it('upserts the feature flag on the workspace', async () => {
    await command.runOnWorkspace({
      workspaceId: 'workspace-id',
      options: { flag: featureFlagKey, value: false },
      index: 0,
      total: 1,
    });

    expect(upsertWorkspaceFeatureFlag).toHaveBeenCalledTimes(1);
    expect(upsertWorkspaceFeatureFlag).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      featureFlag: featureFlagKey,
      value: false,
    });
  });

  it('does not write on dry run', async () => {
    await command.runOnWorkspace({
      workspaceId: 'workspace-id',
      options: { flag: featureFlagKey, value: true, dryRun: true },
      index: 0,
      total: 1,
    });

    expect(upsertWorkspaceFeatureFlag).not.toHaveBeenCalled();
  });
});
