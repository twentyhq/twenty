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
    this.logger.log(
      `[upgrade-position] seeded ${this.appliedCommandNames.size} commands as applied (boot)`,
    );
  }

  getCurrentPosition(): UpgradePosition {
    return { appliedCommandNames: this.appliedCommandNames };
  }

  async beginUpgradeRun(): Promise<void> {
    const completed =
      await this.upgradeMigrationService.getCompletedInstanceCommandNames();

    this.appliedCommandNames = new Set(completed);
    this.isUpgradeRunActive = true;
    this.logger.log(
      `[upgrade-position] beginUpgradeRun applied=${this.appliedCommandNames.size}`,
    );
    this.notifyListeners();
  }

  markCommandApplied(upgradeCommandName: string): void {
    if (!this.isUpgradeRunActive) {
      return;
    }

    if (this.appliedCommandNames.has(upgradeCommandName)) {
      return;
    }

    this.appliedCommandNames.add(upgradeCommandName);
    this.logger.log(
      `[upgrade-position] markCommandApplied "${upgradeCommandName}" applied=${this.appliedCommandNames.size}`,
    );
    this.notifyListeners();
  }

  endUpgradeRun(): void {
    this.isUpgradeRunActive = false;
    this.seedAsAllApplied();
    this.logger.log(
      `[upgrade-position] endUpgradeRun restored applied=${this.appliedCommandNames.size}`,
    );
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
