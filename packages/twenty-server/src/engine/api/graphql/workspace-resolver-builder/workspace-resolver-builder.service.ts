import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { FindDuplicatesResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-duplicates-resolver.factory';
import { MergeManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/merge-many-resolver.factory';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class WorkspaceResolverBuilderService {
  constructor() {}

  shouldBuildResolver(
    objectMetadata: Pick<ObjectMetadataEntity, 'duplicateCriteria'>,
    methodName: WorkspaceResolverBuilderMethodNames,
  ) {
    switch (methodName) {
      case FindDuplicatesResolverFactory.methodName:
        return isDefined(objectMetadata.duplicateCriteria);
      case MergeManyResolverFactory.methodName:
        return isDefined(objectMetadata.duplicateCriteria);
      default:
        return true;
    }
  }
}
