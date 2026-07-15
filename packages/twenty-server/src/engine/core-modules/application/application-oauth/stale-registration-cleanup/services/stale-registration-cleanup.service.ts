import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { STALE_REGISTRATION_CLEANUP_BATCH_SIZE } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/constants/stale-registration-cleanup-batch-size.constant';
import { STALE_REGISTRATION_GRACE_PERIOD_DAYS } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/constants/stale-registration-grace-period-days.constant';

@Injectable()
export class StaleRegistrationCleanupService {
  private readonly logger = new Logger(StaleRegistrationCleanupService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async cleanupStaleRegistrations(): Promise<number> {
    const cutoffDate = this.calculateCutoffDate();
    let totalDeleted = 0;
    let lastCreatedAt: Date | undefined;

    while (true) {
      const staleRegistrations = await this.findStaleRegistrationBatch(
        cutoffDate,
        STALE_REGISTRATION_CLEANUP_BATCH_SIZE,
        lastCreatedAt,
      );

      if (staleRegistrations.length === 0) {
        break;
      }

      lastCreatedAt =
        staleRegistrations[staleRegistrations.length - 1].createdAt;

      const staleIds = staleRegistrations.map(
        (registration) => registration.id,
      );

      // Filter out registrations that have active (non-deleted) installations
      const registrationsWithInstallations = await this.applicationRepository
        .createQueryBuilder('application')
        .select('application.applicationRegistrationId')
        .where(
          'application.applicationRegistrationId IN (:...registrationIds)',
          { registrationIds: staleIds },
        )
        .andWhere('application.deletedAt IS NULL')
        .groupBy('application.applicationRegistrationId')
        .getRawMany<{ application_applicationRegistrationId: string }>();

      const registrationIdsWithInstallations = new Set(
        registrationsWithInstallations.map(
          (row) => row.application_applicationRegistrationId,
        ),
      );

      const idsToDelete = staleIds.filter(
        (id) => !registrationIdsWithInstallations.has(id),
      );

      if (idsToDelete.length > 0) {
        await this.applicationRegistrationRepository.softDelete({
          id: In(idsToDelete),
        });

        this.logger.log(
          `Deleted ${idsToDelete.length} stale OAuth registration(s)`,
        );

        totalDeleted += idsToDelete.length;
      }

      if (staleRegistrations.length < STALE_REGISTRATION_CLEANUP_BATCH_SIZE) {
        break;
      }
    }

    return totalDeleted;
  }

  private async findStaleRegistrationBatch(
    cutoffDate: Date,
    batchSize: number,
    afterCreatedAt?: Date,
  ): Promise<Array<{ id: string; createdAt: Date }>> {
    const queryBuilder = this.applicationRegistrationRepository
      .createQueryBuilder('registration')
      .select('registration.id', 'id')
      .addSelect('registration.createdAt', 'createdAt')
      .where('registration.sourceType = :sourceType', {
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      })
      .andWhere('registration.createdAt < :cutoffDate', { cutoffDate })
      .orderBy('registration.createdAt', 'ASC')
      .take(batchSize);

    if (afterCreatedAt) {
      queryBuilder.andWhere('registration.createdAt > :afterCreatedAt', {
        afterCreatedAt,
      });
    }

    const rows = await queryBuilder.getRawMany<{
      id: string;
      createdAt: Date;
    }>();

    return rows.map((row) => ({
      id: row.id,
      createdAt: new Date(row.createdAt),
    }));
  }

  private calculateCutoffDate(): Date {
    const cutoffDate = new Date();

    cutoffDate.setUTCHours(0, 0, 0, 0);
    cutoffDate.setUTCDate(
      cutoffDate.getUTCDate() - STALE_REGISTRATION_GRACE_PERIOD_DAYS,
    );

    return cutoffDate;
  }
}
