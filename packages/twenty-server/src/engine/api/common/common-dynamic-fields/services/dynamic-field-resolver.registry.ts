import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DYNAMIC_FIELD_RESOLVER_METADATA_KEY } from 'src/engine/api/common/common-dynamic-fields/constants/dynamic-field-resolver-metadata-key.constant';
import { type DynamicFieldResolverInstance } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-resolver-instance.type';

@Injectable()
export class DynamicFieldResolverRegistry implements OnModuleInit {
  private readonly dynamicFieldResolverByObjectUniversalIdentifier = new Map<
    string,
    DynamicFieldResolverInstance
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    for (const { metatype, instance } of this.discoveryService.getProviders()) {
      if (
        !isDefined(metatype) ||
        !isDefined(instance) ||
        Reflect.getMetadata(DYNAMIC_FIELD_RESOLVER_METADATA_KEY, metatype) !==
          true
      ) {
        continue;
      }

      const dynamicFieldResolver = instance as DynamicFieldResolverInstance;

      this.dynamicFieldResolverByObjectUniversalIdentifier.set(
        dynamicFieldResolver.objectUniversalIdentifier,
        dynamicFieldResolver,
      );
    }
  }

  findOrThrow({
    universalIdentifier,
    nameSingular,
  }: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'nameSingular'
  >): DynamicFieldResolverInstance {
    const dynamicFieldResolver =
      this.dynamicFieldResolverByObjectUniversalIdentifier.get(
        universalIdentifier,
      );

    if (!isDefined(dynamicFieldResolver)) {
      throw new Error(
        `No dynamic field resolver is registered for object ${nameSingular}`,
      );
    }

    return dynamicFieldResolver;
  }
}
