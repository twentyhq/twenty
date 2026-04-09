import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const informationBannerIsOpenComponentState =
  createAtomComponentState<boolean>({
    key: 'informationBannerIsOpenComponentState',
    defaultValue: true,
    componentInstanceContext: InformationBannerComponentInstanceContext,
  });
