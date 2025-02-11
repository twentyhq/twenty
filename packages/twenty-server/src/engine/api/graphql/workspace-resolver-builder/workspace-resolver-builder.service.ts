import { Injectable } from '@nestjs/common';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FindDuplicatesResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-duplicates-resolver.factory';

@Injectable()
export class WorkspaceResolverBuilderService {
  constructor() {}

  shouldAllowResolver(
    objectMetadata: ObjectMetadataInterface,
    methodName: WorkspaceResolverBuilderMethodNames,
  ) {
    switch (methodName) {
      case FindDuplicatesResolverFactory.methodName:
        return !!objectMetadata.duplicateCriteria;
      default:
        return true;
    }
  }
}
