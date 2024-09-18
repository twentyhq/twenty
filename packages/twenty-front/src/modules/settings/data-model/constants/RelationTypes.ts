import {
  IconComponent,
  IconRelationManyToMany,
  IconRelationManyToOne,
  IconRelationOneToMany,
  IconRelationOneToOne,
} from 'twenty-ui';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
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
  [RelationDefinitionType.OneToMany]: {
    label: 'Has many',
    Icon: IconRelationOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationDefinitionType.OneToOne]: {
    label: 'Has one',
    Icon: IconRelationOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationDefinitionType.ManyToOne]: {
    label: 'Belongs to one',
    Icon: IconRelationManyToOne,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationDefinitionType.ManyToMany]: {
    label: 'Belongs to many',
    Icon: IconRelationManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
