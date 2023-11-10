import { DocumentNode } from 'graphql';

import { ObjectMetadataItem } from '@/metadata/types/ObjectMetadataItem';

import { OptimisticEffectResolver } from './OptimisticEffectResolver';

export type OptimisticEffectDefinition = {
  key: string;
  query?: DocumentNode;
  typename: string;
  resolver: OptimisticEffectResolver;
  objectMetadataItem?: ObjectMetadataItem;
  isUsingFlexibleBackend?: boolean;
};
