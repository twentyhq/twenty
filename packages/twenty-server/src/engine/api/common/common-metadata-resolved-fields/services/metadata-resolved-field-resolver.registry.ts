import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { METADATA_RESOLVED_FIELD_RESOLVER_METADATA_KEY } from 'src/engine/api/common/common-metadata-resolved-fields/constants/metadata-resolved-field-resolver-metadata-key.constant';
import { type MetadataResolvedFieldResolverInstance } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-resolver-instance.type';

@Injectable()
export class MetadataResolvedFieldResolverRegistry implements OnModuleInit {
  private readonly metadataResolvedFieldResolverByObjectUniversalIdentifier = new Map<
    string,
    MetadataResolvedFieldResolverInstance
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    for (const { metatype, instance } of this.discoveryService.getProviders()) {
      if (
        !isDefined(metatype) ||
        !isDefined(instance) ||
        !isDefined(
          Reflect.getMetadata(METADATA_RESOLVED_FIELD_RESOLVER_METADATA_KEY, metatype),
        )
      ) {
        continue;
      }

      const metadataResolvedFieldResolver: MetadataResolvedFieldResolverInstance = instance;

      this.metadataResolvedFieldResolverByObjectUniversalIdentifier.set(
        metadataResolvedFieldResolver.objectUniversalIdentifier,
        metadataResolvedFieldResolver,
      );
    }
  }

  findOrThrow({
    universalIdentifier,
    nameSingular,
  }: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'nameSingular'
  >): MetadataResolvedFieldResolverInstance {
    const metadataResolvedFieldResolver =
      this.metadataResolvedFieldResolverByObjectUniversalIdentifier.get(
        universalIdentifier,
      );

    if (!isDefined(metadataResolvedFieldResolver)) {
      throw new CommonQueryRunnerException(
        `No metadata resolved field resolver is registered for object ${nameSingular}`,
        CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return metadataResolvedFieldResolver;
  }
}
