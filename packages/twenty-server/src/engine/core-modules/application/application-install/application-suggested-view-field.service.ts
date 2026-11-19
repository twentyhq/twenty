import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ApplicationSuggestedViewFieldDTO } from 'src/engine/core-modules/application/application-install/dtos/application-suggested-view-field.dto';
import { computeMissingSuggestedViewFields } from 'src/engine/core-modules/application/application-install/utils/compute-missing-suggested-view-fields.util';
import { partitionStandaloneViewFieldManifests } from 'src/engine/core-modules/application/application-manifest/utils/partition-standalone-view-field-manifests.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DismissedSuggestedViewFieldsUserVars = Record<string, string[]>;

const getDismissedSuggestedViewFieldsKey = (applicationId: string) =>
  `APPLICATION_SUGGESTED_VIEW_FIELDS_DISMISSED_${applicationId}`;

@Injectable()
export class ApplicationSuggestedViewFieldService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly userVarsService: UserVarsService<DismissedSuggestedViewFieldsUserVars>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  async findMissing({
    applicationId,
    workspaceId,
    userId,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string;
  }): Promise<ApplicationSuggestedViewFieldDTO[]> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      { id: applicationId, workspaceId },
    );

    if (!isDefined(application.applicationRegistrationId)) {
      return [];
    }

    // The registration holds the latest version's manifest: suggestions on fields not installed yet are dropped below.
    const registration = await this.applicationRegistrationRepository.findOne({
      select: { id: true, manifest: true },
      where: { id: application.applicationRegistrationId },
    });

    if (!isDefined(registration?.manifest)) {
      return [];
    }

    const { suggestedViewFieldManifests } =
      partitionStandaloneViewFieldManifests({
        manifest: registration.manifest,
        applicationUniversalIdentifier: application.universalIdentifier,
      });

    if (suggestedViewFieldManifests.length === 0) {
      return [];
    }

    const [
      dismissedUniversalIdentifiers,
      { workspaceCustomFlatApplication },
      {
        flatViewMaps,
        flatViewFieldMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      },
    ] = await Promise.all([
      this.findDismissedUniversalIdentifiers({
        applicationId,
        workspaceId,
        userId,
      }),
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]),
    ]);

    return computeMissingSuggestedViewFields({
      suggestedViewFieldManifests,
      dismissedUniversalIdentifiers: new Set(dismissedUniversalIdentifiers),
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatViewMaps,
      flatViewFieldMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });
  }

  async dismiss({
    applicationId,
    workspaceId,
    userId,
    universalIdentifiers,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string;
    universalIdentifiers: string[];
  }): Promise<void> {
    await this.applicationService.findOneApplicationOrThrow({
      id: applicationId,
      workspaceId,
    });

    const dismissedUniversalIdentifiers =
      await this.findDismissedUniversalIdentifiers({
        applicationId,
        workspaceId,
        userId,
      });

    await this.userVarsService.set({
      userId,
      workspaceId,
      key: getDismissedSuggestedViewFieldsKey(applicationId),
      value: [
        ...new Set([...dismissedUniversalIdentifiers, ...universalIdentifiers]),
      ],
    });
  }

  private async findDismissedUniversalIdentifiers({
    applicationId,
    workspaceId,
    userId,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string;
  }): Promise<string[]> {
    const dismissedUniversalIdentifiers = await this.userVarsService.get({
      userId,
      workspaceId,
      key: getDismissedSuggestedViewFieldsKey(applicationId),
    });

    return Array.isArray(dismissedUniversalIdentifiers)
      ? dismissedUniversalIdentifiers.filter(isString)
      : [];
  }
}
