import {
  type IconComponent,
  IllustrationIconOneToMany,
} from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';
import OneToManySvg from '@/settings/data-model/assets/OneToMany.svg';

export const RELATION_TYPES: Record<
  RelationType,
  {
    label: string;
    Icon: IconComponent;
    imageSrc: string;
    isImageFlipped?: boolean;
  }
> = {
  [RelationType.ONE_TO_MANY]: {
    label: 'Has many',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationType.MANY_TO_ONE]: {
    label: 'Belongs to one',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
