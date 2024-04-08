import { IconLayersLinked, IconRelationOneToOne } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { RelationMetadataType } from '~/generated-metadata/graphql';

import OneToManySvg from '../assets/OneToMany.svg';
import OneToOneSvg from '../assets/OneToOne.svg';
import { RelationType } from '../types/RelationType';

export const RELATION_TYPES: Record<
  RelationType,
  {
    label: string;
    Icon: IconComponent;
    imageSrc: string;
    isImageFlipped?: boolean;
  }
> = {
  [RelationMetadataType.OneToMany]: {
    label: 'Has many',
    Icon: IconLayersLinked,
    imageSrc: OneToManySvg,
  },
  [RelationMetadataType.OneToOne]: {
    label: 'Has one',
    Icon: IconRelationOneToOne,
    imageSrc: OneToOneSvg,
  },
  MANY_TO_ONE: {
    label: 'Belongs to one',
    Icon: IconLayersLinked,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
