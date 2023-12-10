import { IconRelationOneToMany, IconRelationOneToOne } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { RelationMetadataType } from '~/generated-metadata/graphql';

import OneToManySvg from '../assets/OneToMany.svg';
import OneToOneSvg from '../assets/OneToOne.svg';
import { RelationType } from '../types/RelationType';

export const relationTypes: Record<
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
    Icon: IconRelationOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationMetadataType.OneToOne]: {
    label: 'Has one',
    Icon: IconRelationOneToOne,
    imageSrc: OneToOneSvg,
  },
  MANY_TO_ONE: {
    label: 'Belongs to one',
    Icon: IconRelationOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
