import { CardType } from '@/object-record/record-show/constants/CardType';
import { IconComponent } from 'twenty-ui';

export type TabDefinition = {
  id: string;
  title: string;
  Icon: IconComponent;
  hide: {
    onMobile: boolean;
    onDesktop: boolean;
    inRightDrawer: boolean;
    ifFeatureFlagsEnabled: string[];
    ifObjectsDontExist: string[];
    ifRelationsDontExist: string[];
  };
  cards: {
    type: CardType;
  }[];
};
