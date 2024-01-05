import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { OptimisticEffectResolver } from './OptimisticEffectResolver';

export type OptimisticEffectDefinition = {
  typename: string;
  resolver: OptimisticEffectResolver;
  objectMetadataItem?: ObjectMetadataItem;
};
