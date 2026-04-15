import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';

import {
  type UpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';

const VERSION = TWENTY_CURRENT_VERSION;

@RegisteredWorkspaceCommand(VERSION, 1770000000000)
class MinimalWorkspaceCommand {
  async runOnWorkspace(): Promise<void> {}
}

const buildProviderWrapper = (instance: object) => ({
  instance,
  metatype: instance.constructor,
});

const buildServiceWithMockedSequence = async (
  mockSequence: UpgradeStep[],
): Promise<UpgradeSequenceReaderService> => {
  const module = await Test.createTestingModule({
    providers: [
      UpgradeSequenceReaderService,
      UpgradeCommandRegistryService,
      {
        provide: DiscoveryService,
        useValue: {
          getProviders: () =>
            [new MinimalWorkspaceCommand()].map(buildProviderWrapper),
        },
      },
    ],
  }).compile();

  const registryService = module.get(UpgradeCommandRegistryService);

  registryService.onModuleInit();

  const service = module.get(UpgradeSequenceReaderService);

  jest.spyOn(service, 'getUpgradeSequence').mockReturnValue(mockSequence);

  return service;
};

const noopAsync = async () => {};

const makeStep = (kind: UpgradeStep['kind'], name: string): UpgradeStep => {
  const command =
    kind === 'workspace'
      ? { runOnWorkspace: noopAsync }
      : kind === 'slow-instance'
        ? { up: noopAsync, down: noopAsync, runDataMigration: noopAsync }
        : { up: noopAsync, down: noopAsync };

  return {
    kind,
    name,
    command,
    version: VERSION,
    timestamp: 0,
  } as unknown as UpgradeStep;
};

const makeFastInstance = (name: string) => makeStep('fast-instance', name);
const makeWorkspace = (name: string) => makeStep('workspace', name);

describe('UpgradeSequenceReaderService', () => {
  describe('getInitialCursorForNewWorkspace', () => {
    it('should return last workspace command of segment following instance command', async () => {
      // Sequence: Ic0 → Wc0 → Wc1 → Wc2
      // Ic0 completed, next is Wc0 (workspace) → returns Wc2 (last of segment)
      const sequence = [
        makeFastInstance('Ic0'),
        makeWorkspace('Wc0'),
        makeWorkspace('Wc1'),
        makeWorkspace('Wc2'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Wc2');
    });

    it('should return the instance command itself when next step is another instance command', async () => {
      // Sequence: Wc-1 → Ic0 → Ic1 → Wc0 → Wc1
      // Ic0 completed, next is Ic1 (instance) → returns Ic0
      const sequence = [
        makeWorkspace('Wc-1'),
        makeFastInstance('Ic0'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc0'),
        makeWorkspace('Wc1'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Ic0');
    });

    it('should return last workspace command when all instance commands in batch are completed', async () => {
      // Sequence: Wc-1 → Ic0 → Ic1 → Wc0 → Wc1
      // Ic1 completed, next is Wc0 (workspace) → returns Wc1 (last of segment)
      const sequence = [
        makeWorkspace('Wc-1'),
        makeFastInstance('Ic0'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc0'),
        makeWorkspace('Wc1'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic1');

      expect(result.name).toBe('Wc1');
    });

    it('should stop at next instance command boundary', async () => {
      // Sequence: Ic0 → Wc0 → Wc1 → Ic1 → Wc2
      // Ic0 completed, next is Wc0 (workspace) → returns Wc1 (last before Ic1)
      const sequence = [
        makeFastInstance('Ic0'),
        makeWorkspace('Wc0'),
        makeWorkspace('Wc1'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc2'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Wc1');
    });

    it('should return the instance command itself when at end of sequence', async () => {
      // Sequence: Wc0 → Ic0 (no workspace commands after Ic0)
      // Ic0 completed, next is undefined → returns Ic0
      const sequence = [makeWorkspace('Wc0'), makeFastInstance('Ic0')];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Ic0');
    });

    it('should return the instance command itself when no workspace command exists before it', async () => {
      // Sequence: Ic0 → Ic1 → Wc0 (no workspace before Ic0)
      // Ic0 completed, next is Ic1 (instance) → returns Ic0
      const sequence = [
        makeFastInstance('Ic0'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc0'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Ic0');
    });

    it('should return final segment when last instance command is completed', async () => {
      // Sequence: Wc0 → Ic0 → Wc1 → Ic1 → Wc2 → Wc3
      // Ic1 completed, next is Wc2 (workspace) → returns Wc3 (last of final segment)
      const sequence = [
        makeWorkspace('Wc0'),
        makeFastInstance('Ic0'),
        makeWorkspace('Wc1'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc2'),
        makeWorkspace('Wc3'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic1');

      expect(result.name).toBe('Wc3');
    });

    it('should handle single workspace command in segment', async () => {
      // Sequence: Ic0 → Wc0 → Ic1 → Wc1
      // Ic0 completed, next is Wc0 (workspace) → returns Wc0 (only one in segment)
      const sequence = [
        makeFastInstance('Ic0'),
        makeWorkspace('Wc0'),
        makeFastInstance('Ic1'),
        makeWorkspace('Wc1'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic0');

      expect(result.name).toBe('Wc0');
    });

    it('should return the instance command itself when sequence ends with instance commands batch', async () => {
      // Sequence: Ic0 → Wc0 → Wc1 → Ic1 → Ic2 (no workspace after Ic1/Ic2)
      // Ic2 completed, next is undefined → returns Ic2
      const sequence = [
        makeFastInstance('Ic0'),
        makeWorkspace('Wc0'),
        makeWorkspace('Wc1'),
        makeFastInstance('Ic1'),
        makeFastInstance('Ic2'),
      ];

      const service = await buildServiceWithMockedSequence(sequence);

      const result = service.getInitialCursorForNewWorkspace('Ic2');

      expect(result.name).toBe('Ic2');
    });
  });
});
