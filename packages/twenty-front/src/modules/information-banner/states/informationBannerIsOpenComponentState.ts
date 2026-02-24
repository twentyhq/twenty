import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const informationBannerIsOpenComponentState =
  createComponentStateV2<boolean>({
    key: 'informationBannerIsOpenComponentState',
    defaultValue: true,
    componentInstanceContext: InformationBannerComponentInstanceContext,
  });
