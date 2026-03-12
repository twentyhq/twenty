import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, LessThan, Repository } from 'typeorm';

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

    while (true) {
      const staleRegistrations = await this.findStaleRegistrationBatch(
        cutoffDate,
        STALE_REGISTRATION_CLEANUP_BATCH_SIZE,
      );

      if (staleRegistrations.length === 0) {
        break;
      }

      const staleIds = staleRegistrations.map(
        (registration) => registration.id,
      );

      // Filter out registrations that have active installations
      const registrationsWithInstallations = await this.applicationRepository
        .createQueryBuilder('application')
        .select('application.applicationRegistrationId')
        .where(
          'application.applicationRegistrationId IN (:...registrationIds)',
          { registrationIds: staleIds },
        )
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
        // Hard delete since these are orphaned OAuth registrations
        await this.applicationRegistrationRepository.delete({
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
  ): Promise<Array<{ id: string }>> {
    return this.applicationRegistrationRepository.find({
      select: ['id'],
      where: {
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        createdAt: LessThan(cutoffDate),
      },
      order: { createdAt: 'ASC' },
      take: batchSize,
    });
  }

  private calculateCutoffDate(): Date {
    const cutoffDate = new Date();

    cutoffDate.setUTCHours(0, 0, 0, 0);
    cutoffDate.setDate(
      cutoffDate.getDate() - STALE_REGISTRATION_GRACE_PERIOD_DAYS,
    );

    return cutoffDate;
  }
}
