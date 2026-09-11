import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type ReadRegistrationAsset,
  ApplicationRegistrationAssetService,
} from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationRegistrationAdditionalFields } from 'src/engine/core-modules/application/application-registration/types/application-registration-additional-fields.type';
import { areRegistrationAssetsStored } from 'src/engine/core-modules/application/application-registration/utils/are-registration-assets-stored.util';
import type { Manifest } from 'twenty-shared/application';

// Single routine turning a published version into a registration row, shared
// by the npm catalog sync and by private application deployments.
@Injectable()
export class ApplicationCatalogRegistrationService {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
  ) {}

  async registerPublishedVersion({
    universalIdentifier,
    name,
    sourceType,
    sourcePackage,
    latestAvailableVersion,
    manifest,
    readAsset,
    additionalFields,
    canReuseStoredAssets = false,
  }: {
    universalIdentifier: string;
    name: string;
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage: string | null;
    latestAvailableVersion: string | null;
    manifest: Manifest;
    readAsset: ReadRegistrationAsset;
    additionalFields?: ApplicationRegistrationAdditionalFields;
    canReuseStoredAssets?: boolean;
  }): Promise<ApplicationRegistrationEntity> {
    const previousVersion = (
      await this.applicationRegistrationService.findOneByUniversalIdentifierGlobal(
        universalIdentifier,
      )
    )?.latestAvailableVersion;

    await this.applicationRegistrationService.upsertFromCatalog({
      universalIdentifier,
      name,
      sourceType,
      sourcePackage,
      latestAvailableVersion,
      manifest,
      additionalFields,
    });

    const registration =
      await this.applicationRegistrationService.findOneByUniversalIdentifierGlobal(
        universalIdentifier,
      );

    if (!isDefined(registration)) {
      throw new ApplicationRegistrationException(
        `Registration for ${universalIdentifier} not found right after publishing it`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    const isUnchangedVersion =
      canReuseStoredAssets && previousVersion === latestAvailableVersion;

    if (
      isUnchangedVersion &&
      areRegistrationAssetsStored(registration, manifest.application)
    ) {
      return registration;
    }

    await this.applicationRegistrationAssetService.storeRegistrationAssets({
      applicationRegistrationId: registration.id,
      manifestApplication: manifest.application,
      readAsset,
      skipAlreadyStoredPaths: isUnchangedVersion,
    });

    // Assets are written on the row after it was read, so callers returning it
    // would otherwise answer with a registration that has no logo yet.
    return this.applicationRegistrationService.findOneByIdGlobal(
      registration.id,
    );
  }
}
