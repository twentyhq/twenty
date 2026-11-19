import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class WorkspaceResolverBuilderService {
  constructor() {}

  shouldBuildResolver(
    objectMetadata: Pick<ObjectMetadataEntity, 'duplicateCriteria'>,
    methodName: WorkspaceResolverBuilderMethodNames,
  ) {
    switch (methodName) {
      case RESOLVER_METHOD_NAMES.FIND_DUPLICATES:
        return isDefined(objectMetadata.duplicateCriteria);
      default:
        return true;
    }
  }
}
