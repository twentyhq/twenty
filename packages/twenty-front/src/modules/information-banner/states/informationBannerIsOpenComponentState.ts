import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const informationBannerIsOpenComponentState =
  createComponentState<boolean>({
    key: 'informationBannerIsOpenComponentState',
    defaultValue: true,
    componentInstanceContext: InformationBannerComponentInstanceContext,
  });
