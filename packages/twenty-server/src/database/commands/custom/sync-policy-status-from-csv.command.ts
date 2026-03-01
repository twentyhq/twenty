import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

// Self-contained map covering every known CSV variant
const POLICY_STATUS_NAME_MAP: Record<string, string> = {
  submitted: 'SUBMITTED',
  pending: 'PENDING',
  declined: 'DECLINED',
  canceled: 'CANCELED',
  incomplete: 'INCOMPLETE',
  'active / approved': 'ACTIVE_APPROVED',
  'active/approved': 'ACTIVE_APPROVED',
  'active - approved': 'ACTIVE_APPROVED',
  'active / placed': 'ACTIVE_PLACED',
  'active/placed': 'ACTIVE_PLACED',
  'active - placed': 'ACTIVE_PLACED',
  active: 'ACTIVE',
  'payment error - canceled': 'PAYMENT_ERROR_CANCELED',
  'payment error - active/approved': 'PAYMENT_ERROR_ACTIVE_APPROVED',
  'payment error - active/placed': 'PAYMENT_ERROR_ACTIVE_PLACED',
  'payment error - active approved': 'PAYMENT_ERROR_ACTIVE_APPROVED',
  'payment error - active placed': 'PAYMENT_ERROR_ACTIVE_PLACED',
};

type CsvRow = {
  policyNumber: string;
  policyId: string;
  statusName: string;
};

type SyncReport = {
  totalRows: number;
  updated: number;
  alreadyCorrect: number;
  notFound: number;
  unmappedStatus: number;
  duplicateMatch: number;
  errors: number;
  statusChanges: Map<string, number>;
  unmappedValues: Set<string>;
  notFoundRows: CsvRow[];
  duplicateRows: CsvRow[];
};

@Command({
  name: 'workspace:sync-policy-status',
  description:
    'Sync policy statuses from an old CRM CSV export. Supports --dry-run.',
})
export class SyncPolicyStatusFromCsvCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected override readonly logger = new Logger(
    SyncPolicyStatusFromCsvCommand.name,
  );

  private csvPath: string;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  @Option({
    flags: '--csv-path <path>',
    description: 'Path to the old CRM policy CSV export',
    required: true,
  })
  parseCsvPath(val: string): string {
    this.csvPath = val;

    return val;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!this.csvPath) {
      this.logger.error('--csv-path is required');

      return;
    }

    if (!fs.existsSync(this.csvPath)) {
      this.logger.error(`CSV file not found: ${this.csvPath}`);

      return;
    }

    // Parse CSV
    const csvRows = this.parseCsv(this.csvPath);

    this.logger.log(`Parsed ${csvRows.length} rows from CSV`);

    if (csvRows.length === 0) {
      return;
    }

    // Load all policies into memory maps
    const policyRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'policy',
      { shouldBypassPermissionChecks: true },
    );

    const allPolicies = (await policyRepo.find()) as Array<
      Record<string, unknown>
    >;

    this.logger.log(`Loaded ${allPolicies.length} policies from workspace`);

    // Build lookup maps
    const byPolicyNumber = new Map<string, Array<Record<string, unknown>>>();
    const byApplicationId = new Map<string, Array<Record<string, unknown>>>();

    for (const policy of allPolicies) {
      const policyNumber = (policy.policyNumber as string) || '';
      const applicationId = (policy.applicationId as string) || '';

      if (policyNumber) {
        const existing = byPolicyNumber.get(policyNumber) || [];

        existing.push(policy);
        byPolicyNumber.set(policyNumber, existing);
      }

      if (applicationId) {
        const existing = byApplicationId.get(applicationId) || [];

        existing.push(policy);
        byApplicationId.set(applicationId, existing);
      }
    }

    // Process CSV rows
    const report: SyncReport = {
      totalRows: csvRows.length,
      updated: 0,
      alreadyCorrect: 0,
      notFound: 0,
      unmappedStatus: 0,
      duplicateMatch: 0,
      errors: 0,
      statusChanges: new Map(),
      unmappedValues: new Set(),
      notFoundRows: [],
      duplicateRows: [],
    };

    for (const row of csvRows) {
      const mappedStatus = POLICY_STATUS_NAME_MAP[row.statusName.toLowerCase()];

      if (!mappedStatus) {
        report.unmappedStatus++;
        report.unmappedValues.add(row.statusName);

        continue;
      }

      // Look up by policyNumber first, then applicationId
      let matches = byPolicyNumber.get(row.policyNumber);

      if (!matches || matches.length === 0) {
        matches = byApplicationId.get(row.policyNumber);
      }

      if (!matches || matches.length === 0) {
        report.notFound++;

        if (report.notFoundRows.length < 50) {
          report.notFoundRows.push(row);
        }

        continue;
      }

      if (matches.length > 1) {
        report.duplicateMatch++;

        if (report.duplicateRows.length < 50) {
          report.duplicateRows.push(row);
        }

        continue;
      }

      const policy = matches[0];
      const currentStatus = (policy.status as string) || '';

      if (currentStatus === mappedStatus) {
        report.alreadyCorrect++;

        continue;
      }

      const changeKey = `${currentStatus || '(empty)'} -> ${mappedStatus}`;

      report.statusChanges.set(
        changeKey,
        (report.statusChanges.get(changeKey) || 0) + 1,
      );

      if (options.dryRun) {
        if (options.verbose) {
          this.logger.log(
            `[DRY RUN] Policy ${row.policyNumber}: ${currentStatus || '(empty)'} -> ${mappedStatus}`,
          );
        }

        report.updated++;

        continue;
      }

      try {
        await policyRepo.update(
          { id: policy.id as string },
          { status: mappedStatus },
        );

        report.updated++;

        if (options.verbose) {
          this.logger.log(
            `Updated policy ${row.policyNumber}: ${currentStatus || '(empty)'} -> ${mappedStatus}`,
          );
        }
      } catch (error) {
        report.errors++;
        this.logger.warn(
          `Failed to update policy ${row.policyNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Print report
    this.printReport(report, options.dryRun ?? false);
  }

  private parseCsv(filePath: string): CsvRow[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines.length < 2) {
      return [];
    }

    // Parse header to find column indices
    const headers = this.parseCsvLine(lines[0]).map((h) =>
      h.trim().toLowerCase(),
    );
    const policyNumberIdx = headers.indexOf('policy number');
    const statusIdx = headers.indexOf('policy status');
    const policyIdIdx = headers.indexOf('policy id');

    if (policyNumberIdx === -1 || statusIdx === -1) {
      this.logger.error(
        `CSV missing required columns. Found: ${headers.join(', ')}`,
      );
      this.logger.error('Expected columns: "Policy Number", "Policy Status"');

      return [];
    }

    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      const fields = this.parseCsvLine(line);
      const policyNumber = (fields[policyNumberIdx] || '').trim();
      const statusName = (fields[statusIdx] || '').trim();
      const policyId =
        policyIdIdx !== -1 ? (fields[policyIdIdx] || '').trim() : '';

      if (!policyNumber || !statusName) continue;

      rows.push({ policyNumber, statusName, policyId });
    }

    return rows;
  }

  // Simple CSV parser that handles quoted fields with commas
  private parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    fields.push(current);

    return fields;
  }

  private printReport(report: SyncReport, dryRun: boolean): void {
    const prefix = dryRun ? '[DRY RUN] ' : '';

    this.logger.log('');
    this.logger.log(chalk.blue('═'.repeat(60)));
    this.logger.log(chalk.blue(`${prefix}POLICY STATUS SYNC REPORT`));
    this.logger.log(chalk.blue('═'.repeat(60)));
    this.logger.log(`  Total CSV rows:      ${report.totalRows}`);
    this.logger.log(
      `  ${dryRun ? 'Would update' : 'Updated'}:        ${report.updated}`,
    );
    this.logger.log(`  Already correct:     ${report.alreadyCorrect}`);
    this.logger.log(`  Not found:           ${report.notFound}`);
    this.logger.log(`  Unmapped status:     ${report.unmappedStatus}`);
    this.logger.log(`  Duplicate match:     ${report.duplicateMatch}`);
    this.logger.log(`  Errors:              ${report.errors}`);

    if (report.statusChanges.size > 0) {
      this.logger.log('');
      this.logger.log(chalk.blue('Status Change Breakdown:'));

      const sorted = [...report.statusChanges.entries()].sort(
        (a, b) => b[1] - a[1],
      );

      for (const [change, count] of sorted) {
        this.logger.log(`  ${change}: ${count}`);
      }
    }

    if (report.unmappedValues.size > 0) {
      this.logger.log('');
      this.logger.log(chalk.yellow('Unmapped status values:'));

      for (const value of report.unmappedValues) {
        this.logger.log(`  "${value}"`);
      }
    }

    if (report.notFoundRows.length > 0) {
      this.logger.log('');
      this.logger.log(
        chalk.yellow(
          `Not found (first ${report.notFoundRows.length} of ${report.notFound}):`,
        ),
      );

      for (const row of report.notFoundRows) {
        this.logger.log(
          `  policyNumber=${row.policyNumber}  status=${row.statusName}`,
        );
      }
    }

    if (report.duplicateRows.length > 0) {
      this.logger.log('');
      this.logger.log(
        chalk.yellow(
          `Duplicate matches (first ${report.duplicateRows.length} of ${report.duplicateMatch}):`,
        ),
      );

      for (const row of report.duplicateRows) {
        this.logger.log(
          `  policyNumber=${row.policyNumber}  status=${row.statusName}`,
        );
      }
    }

    this.logger.log(chalk.blue('═'.repeat(60)));
  }
}
