import { Command, CommandRunner, Option } from 'nest-commander';

import { CommandLogger } from 'src/database/commands/logger';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';

const DEFAULT_BATCH_SIZE = 200;
const MAX_BATCH_SIZE = 5000;

type RotateSecretEncryptionCommandOptions = {
  site?: string;
  batchSize?: number;
  dryRun?: boolean;
};

@Command({
  name: 'secret-encryption:rotate',
  description:
    'Re-encrypts every at-rest secret stored in an enc:v2 envelope using the current ENCRYPTION_KEY. Idempotent: rows already on the current key are skipped via a SQL filter, so the command is safe to interrupt and re-run. Requires FALLBACK_ENCRYPTION_KEY to be set to the previous key when rotating to a fresh ENCRYPTION_KEY. Pass --site=<name> to scope to a single site; an invalid value lists all available sites.',
})
export class RotateSecretEncryptionCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    private readonly secretEncryptionRotationRunnerService: SecretEncryptionRotationRunnerService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-s, --site <site>',
    description:
      'Limit rotation to a single site. Omit to run all sites. An invalid value lists all available sites.',
    required: false,
  })
  parseSite(value: string): string {
    return value;
  }

  @Option({
    flags: '-b, --batch-size <batchSize>',
    description: `Number of rows fetched per batch (default ${DEFAULT_BATCH_SIZE}, capped at ${MAX_BATCH_SIZE}).`,
    required: false,
  })
  parseBatchSize(value: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`Invalid --batch-size value: ${value}`);
    }

    return Math.min(parsed, MAX_BATCH_SIZE);
  }

  @Option({
    flags: '-d, --dry-run',
    description:
      'Decrypt + re-encrypt rows in memory but skip the UPDATE. Useful for sizing a rotation before pulling the trigger.',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  override async run(
    _passedParams: string[],
    options: RotateSecretEncryptionCommandOptions,
  ): Promise<void> {
    const summary = await this.secretEncryptionRotationRunnerService.run({
      site: options.site,
      batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
      dryRun: options.dryRun ?? false,
    });

    const totalErrors = summary.results.reduce(
      (sum, result) => sum + result.errors,
      0,
    );

    if (totalErrors > 0) {
      throw new Error(
        `secret-encryption:rotate completed with ${totalErrors} error(s) — see logs above.`,
      );
    }
  }
}
