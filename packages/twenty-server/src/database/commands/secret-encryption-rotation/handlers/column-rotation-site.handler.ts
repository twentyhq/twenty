import {
  type FindOptionsWhere,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

import {
  SecretEncryptionRotationHandler,
  type SecretEncryptionRotationContext,
  type SecretEncryptionRotationOutcome,
} from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { SecretEncryptionColumnRotationService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-column-rotation.service';

export type ColumnRotationSiteConfig<Entity extends ObjectLiteral> = {
  siteName: string;
  repository: Repository<Entity>;
  encryptedColumns: string[];
  isWorkspaceScoped?: boolean;
  extraWhere?: FindOptionsWhere<Entity>;
};

export class ColumnRotationSiteHandler<
  Entity extends ObjectLiteral = ObjectLiteral,
> extends SecretEncryptionRotationHandler {
  readonly siteName: string;

  constructor(
    private readonly config: ColumnRotationSiteConfig<Entity>,
    private readonly secretEncryptionColumnRotationService: SecretEncryptionColumnRotationService,
  ) {
    super();
    this.siteName = config.siteName;
  }

  async countRemaining({
    currentEncryptionKeyId,
  }: {
    currentEncryptionKeyId: string;
  }): Promise<number> {
    return this.secretEncryptionColumnRotationService.countNonCurrentRows({
      repository: this.config.repository,
      currentEncryptionKeyId,
      encryptedColumns: this.config.encryptedColumns,
      extraWhere: this.config.extraWhere,
    });
  }

  async rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome> {
    const aggregated: SecretEncryptionRotationOutcome = {
      rotated: 0,
      skipped: 0,
      errors: 0,
    };

    for (const encryptedColumn of this.config.encryptedColumns) {
      const outcome =
        await this.secretEncryptionColumnRotationService.rotateColumn({
          ...context,
          repository: this.config.repository,
          siteName: this.siteName,
          encryptedColumn,
          isWorkspaceScoped: this.config.isWorkspaceScoped,
          extraWhere: this.config.extraWhere,
        });

      aggregated.rotated += outcome.rotated;
      aggregated.skipped += outcome.skipped;
      aggregated.errors += outcome.errors;
    }

    return aggregated;
  }
}
