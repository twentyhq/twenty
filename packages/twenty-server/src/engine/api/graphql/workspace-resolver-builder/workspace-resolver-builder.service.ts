import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FindDuplicatesResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-duplicates-resolver.factory';
import { MergeManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/merge-many-resolver.factory';

@Injectable()
export class WorkspaceResolverBuilderService {
  constructor() {}

  shouldBuildResolver(
    objectMetadata: Pick<
      ObjectMetadataInterface,
      'duplicateCriteria' | 'nameSingular'
    >,
    methodName: WorkspaceResolverBuilderMethodNames,
  ) {
    switch (methodName) {
      case FindDuplicatesResolverFactory.methodName:
        return isDefined(objectMetadata.duplicateCriteria);
      case MergeManyResolverFactory.methodName:
        return objectMetadata.nameSingular === 'company';
      default:
        return true;
    }
  }
}
