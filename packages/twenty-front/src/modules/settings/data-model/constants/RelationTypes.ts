import {
  IconComponent,
  IconRelationManyToOne,
  IconRelationOneToMany,
  IconRelationOneToOne,
} from 'twenty-ui';

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
    label: 'Tem muitos(as)',
    Icon: IconRelationOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationMetadataType.OneToOne]: {
    label: 'Tem um(a)',
    Icon: IconRelationOneToOne,
    imageSrc: OneToOneSvg,
  },
  MANY_TO_ONE: {
    label: 'Pertence a um(a)',
    Icon: IconRelationManyToOne,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
