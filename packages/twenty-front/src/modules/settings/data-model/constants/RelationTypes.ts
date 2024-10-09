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
  [RelationDefinitionType.OneToMany]: {
    label: 'Has many',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationDefinitionType.OneToOne]: {
    label: 'Has one',
    Icon: IllustrationIconOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationDefinitionType.ManyToOne]: {
    label: 'Belongs to one',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationDefinitionType.ManyToMany]: {
    label: 'Belongs to many',
    Icon: IllustrationIconManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
