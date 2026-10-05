import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { convertValidationRuleFromFieldSymbols } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-validation-rule-from-field-symbols.util';
import { convertValidationRuleToFieldSymbols } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-validation-rule-to-field-symbols.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ValidationRuleExpressionAndBindings = {
  expression: string;
  bindings: Record<string, string>;
};

type ValidationRuleRow = ValidationRuleExpressionAndBindings & { id: string };

@RegisteredWorkspaceCommand('2.46.0', 1791210946811)
@Command({
  name: 'upgrade:2-46:bind-validation-rule-expressions-to-field-symbols',
  description:
    'Rewrite validation rule expressions to field symbols bound to field universal identifiers, so a field rename no longer rewrites them',
})
export class BindValidationRuleExpressionsToFieldSymbolsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const convertedCount = await this.convertValidationRules({
      dataSource,
      workspaceId,
      isDryRun: options.dryRun ?? false,
      convert: convertValidationRuleToFieldSymbols,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: bound ${convertedCount} validation rule expression(s) to field symbols`,
    );
  }

  async down({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const fieldRows: { universalIdentifier: string; name: string }[] =
      await dataSource.query(
        `SELECT "universalIdentifier", name FROM core."fieldMetadata" WHERE "workspaceId" = $1`,
        [workspaceId],
      );
    const fieldNameByUniversalIdentifier = new Map(
      fieldRows.map(({ universalIdentifier, name }) => [
        universalIdentifier,
        name,
      ]),
    );

    const convertedCount = await this.convertValidationRules({
      dataSource,
      workspaceId,
      isDryRun: options.dryRun ?? false,
      convert: (validationRule) =>
        convertValidationRuleFromFieldSymbols({
          ...validationRule,
          fieldNameByUniversalIdentifier,
        }),
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: wrote ${convertedCount} validation rule expression(s) back with field names`,
    );
  }

  private async convertValidationRules({
    dataSource,
    workspaceId,
    isDryRun,
    convert,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    isDryRun: boolean;
    convert: (
      validationRule: ValidationRuleExpressionAndBindings,
    ) => ValidationRuleExpressionAndBindings | null;
  }): Promise<number> {
    const validationRuleRows: ValidationRuleRow[] = await dataSource.query(
      `SELECT id, expression, bindings FROM core."validationRule" WHERE "workspaceId" = $1`,
      [workspaceId],
    );

    const convertedValidationRules = validationRuleRows.flatMap(
      (validationRuleRow) => {
        const convertedValidationRule = convert(validationRuleRow);

        return isDefined(convertedValidationRule)
          ? [{ id: validationRuleRow.id, ...convertedValidationRule }]
          : [];
      },
    );

    if (convertedValidationRules.length === 0 || isDryRun) {
      return convertedValidationRules.length;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { id, expression, bindings } of convertedValidationRules) {
        await queryRunner.query(
          `UPDATE core."validationRule" SET expression = $1, bindings = $2::jsonb WHERE id = $3 AND "workspaceId" = $4`,
          [expression, JSON.stringify(bindings), id, workspaceId],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatValidationRuleMaps',
    ]);

    return convertedValidationRules.length;
  }
}
