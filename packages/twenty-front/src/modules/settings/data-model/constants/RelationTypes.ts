import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type IconComponent, IllustrationIconOneToMany } from 'twenty-ui/icon';
import { RelationType } from '~/generated-metadata/graphql';
import OneToManySvg from '@/settings/data-model/assets/OneToMany.svg';

export const RELATION_TYPES: Record<
  RelationType,
  {
    label: MessageDescriptor;
    Icon: IconComponent;
    imageSrc: string;
    isImageFlipped?: boolean;
  }
> = {
  [RelationType.ONE_TO_MANY]: {
    label: msg`Has many`,
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationType.MANY_TO_ONE]: {
    label: msg`Belongs to one`,
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
