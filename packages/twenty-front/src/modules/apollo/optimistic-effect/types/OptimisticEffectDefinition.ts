import { DocumentNode } from 'graphql';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { OptimisticEffectResolver } from './OptimisticEffectResolver';

export type OptimisticEffectDefinition = {
  query?: DocumentNode;
  typename: string;
  resolver: OptimisticEffectResolver;
  objectMetadataItem?: ObjectMetadataItem;
};
