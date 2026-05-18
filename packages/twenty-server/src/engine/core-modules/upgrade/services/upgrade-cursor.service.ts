import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import {
  formatUpgradeAwareDecoratorReferenceProblems,
  validateUpgradeAwareEntityDecorators,
} from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';

export type UpgradeCursorChangeListener = (cursor: number) => void;

@Injectable()
export class UpgradeCursorService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeCursorService.name);

  private stepNameToIndex: Map<string, number> = new Map();
  private currentCursor = Number.MAX_SAFE_INTEGER;
  private isUpgradeRunActive = false;
  private listeners: UpgradeCursorChangeListener[] = [];

  constructor(
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  onModuleInit(): void {
    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

    for (const [index, step] of sequence.entries()) {
      this.stepNameToIndex.set(step.name, index);
    }

    this.validateDecoratorsAgainstSequence();
    this.currentCursor = sequence.length;
    this.logger.log(
      `[upgrade-cursor] sequence has ${sequence.length} steps; cursor seeded past the end`,
    );
  }

  getCurrentCursor(): number {
    return this.currentCursor;
  }

  isStepAppliedAtCurrentCursor(stepName: string): boolean {
    const index = this.stepNameToIndex.get(stepName);

    if (index === undefined) {
      return false;
    }

    return index < this.currentCursor;
  }

  async beginUpgradeRun(): Promise<void> {
    const lastAttempted =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommand();

    if (lastAttempted === null) {
      this.currentCursor = 0;
    } else {
      const index = this.stepNameToIndex.get(lastAttempted.name);

      if (index === undefined) {
        this.currentCursor = 0;
      } else {
        this.currentCursor =
          lastAttempted.status === 'completed' ? index + 1 : index;
      }
    }

    this.isUpgradeRunActive = true;
    this.logger.log(
      `[upgrade-cursor] beginUpgradeRun cursor=${this.currentCursor}`,
    );
    this.notifyListeners();
  }

  advanceCursorTo(stepName: string): void {
    if (!this.isUpgradeRunActive) {
      return;
    }

    const index = this.stepNameToIndex.get(stepName);

    if (index === undefined) {
      return;
    }

    const nextCursor = index + 1;

    if (nextCursor <= this.currentCursor) {
      return;
    }

    this.currentCursor = nextCursor;
    this.logger.log(
      `[upgrade-cursor] advanceCursorTo "${stepName}" cursor=${this.currentCursor}`,
    );
    this.notifyListeners();
  }

  endUpgradeRun(): void {
    this.isUpgradeRunActive = false;
    this.currentCursor = this.stepNameToIndex.size;
    this.logger.log(
      `[upgrade-cursor] endUpgradeRun cursor=${this.currentCursor}`,
    );
    this.notifyListeners();
  }

  onCursorChanged(listener: UpgradeCursorChangeListener): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentCursor);
    }
  }

  private validateDecoratorsAgainstSequence(): void {
    const entityClasses = this.coreDataSource.entityMetadatas
      .map((metadata) => metadata.target)
      .filter((target): target is Function => typeof target === 'function');

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses,
      knownStepNames: new Set(this.stepNameToIndex.keys()),
    });

    if (problems.length === 0) {
      return;
    }

    const formatted = formatUpgradeAwareDecoratorReferenceProblems(problems);

    throw new Error(
      `Upgrade-aware entity decorators reference unknown upgrade step names. ` +
        `Either fix the upgradeCommandName string, or register the missing step.\n${formatted}`,
    );
  }
}
