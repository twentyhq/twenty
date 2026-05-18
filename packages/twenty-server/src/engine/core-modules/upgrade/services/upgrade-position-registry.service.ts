import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';
import {
  formatUpgradeAwareDecoratorReferenceProblems,
  validateUpgradeAwareEntityDecorators,
} from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';

export type UpgradePositionChangeListener = (
  position: UpgradePosition,
) => void;

// Tracks which upgrade commands are applied at any moment so the metadata
// mutator and repository proxies can resolve historical entity shapes.
//
// State machine:
//   - boot: appliedCommandNames seeded with every command name from the
//     registry. Decorators behave as no-ops because every reference resolves
//     to "applied".
//   - beginUpgradeRun(): replaces the set with the actual completed instance
//     commands read from core.upgradeMigration. Decorators now reflect the
//     historical DB state.
//   - markCommandApplied(name): called after each step succeeds. The set grows
//     monotonically until endUpgradeRun().
//   - endUpgradeRun(): restores the "all applied" seed so normal app activity
//     after the run is decorator-free again.
@Injectable()
export class UpgradePositionRegistry implements OnModuleInit {
  private readonly logger = new Logger(UpgradePositionRegistry.name);

  private appliedCommandNames: Set<string> = new Set();
  private isUpgradeRunActive = false;
  private listeners: UpgradePositionChangeListener[] = [];

  constructor(
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  onModuleInit(): void {
    this.validateDecoratorsAgainstRegistry();
    this.seedAsAllApplied();
  }

  getCurrentPosition(): UpgradePosition {
    return { appliedCommandNames: this.appliedCommandNames };
  }

  // Replaces the current set with completed instance commands read from
  // core.upgradeMigration. Listeners are notified once.
  async beginUpgradeRun(): Promise<void> {
    const completed =
      await this.upgradeMigrationService.getCompletedInstanceCommandNames();

    this.appliedCommandNames = new Set(completed);
    this.isUpgradeRunActive = true;
    this.notifyListeners();
  }

  // Adds a single command to the applied set. No-op if not currently in an
  // upgrade run (boot-time seed already includes every command).
  markCommandApplied(upgradeCommandName: string): void {
    if (!this.isUpgradeRunActive) {
      return;
    }

    if (this.appliedCommandNames.has(upgradeCommandName)) {
      return;
    }

    this.appliedCommandNames.add(upgradeCommandName);
    this.notifyListeners();
  }

  // Restores the all-applied seed. Listeners are notified once. Safe to call
  // even if no run was active.
  endUpgradeRun(): void {
    this.isUpgradeRunActive = false;
    this.seedAsAllApplied();
    this.notifyListeners();
  }

  onPositionChanged(listener: UpgradePositionChangeListener): void {
    this.listeners.push(listener);
  }

  private seedAsAllApplied(): void {
    this.appliedCommandNames = new Set(
      this.upgradeCommandRegistryService.getAllRegisteredCommandNames(),
    );
  }

  private notifyListeners(): void {
    const snapshot = this.getCurrentPosition();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private validateDecoratorsAgainstRegistry(): void {
    const knownCommandNames = new Set(
      this.upgradeCommandRegistryService.getAllRegisteredCommandNames(),
    );

    const entityClasses = this.coreDataSource.entityMetadatas
      .map((metadata) => metadata.target)
      .filter((target): target is Function => typeof target === 'function');

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses,
      knownCommandNames,
    });

    if (problems.length === 0) {
      return;
    }

    const formatted = formatUpgradeAwareDecoratorReferenceProblems(problems);

    throw new Error(
      `Upgrade-aware entity decorators reference unknown upgrade command names. ` +
        `Either fix the upgradeCommandName string, or register the missing command.\n${formatted}`,
    );
  }
}
