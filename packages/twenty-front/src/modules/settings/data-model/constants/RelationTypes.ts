import {
  IconComponent,
  IllustrationIconManyToMany,
  IllustrationIconOneToMany,
  IllustrationIconOneToOne,
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
  [RelationDefinitionType.ONE_TO_MANY]: {
    label: 'Has many',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationDefinitionType.ONE_TO_ONE]: {
    label: 'Has one',
    Icon: IllustrationIconOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationDefinitionType.MANY_TO_ONE]: {
    label: 'Belongs to one',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationDefinitionType.MANY_TO_MANY]: {
    label: 'Belongs to many',
    Icon: IllustrationIconManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
