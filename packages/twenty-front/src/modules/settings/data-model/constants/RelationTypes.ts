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
    label: 'Tem muitos(as)',
    Icon: IconRelationOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationDefinitionType.OneToOne]: {
    label: 'Tem um(a)',
    Icon: IconRelationOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationDefinitionType.ManyToOne]: {
    label: 'Pertence a um(a)',
    Icon: IconRelationManyToOne,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationDefinitionType.ManyToMany]: {
    label: 'Pertence a muitos(as)',
    Icon: IconRelationManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
