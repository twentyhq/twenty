import {
    IconComponent,
    IllustrationIconManyToMany,
    IllustrationIconOneToMany,
    IllustrationIconOneToOne,
} from 'twenty-ui/display';
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
  [RelationMetadataType.ONE_TO_MANY]: {
    label: 'Has many',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationMetadataType.ONE_TO_ONE]: {
    label: 'Has one',
    Icon: IllustrationIconOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationMetadataType.MANY_TO_ONE]: {
    label: 'Belongs to one',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationMetadataType.MANY_TO_MANY]: {
    label: 'Belongs to many',
    Icon: IllustrationIconManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
