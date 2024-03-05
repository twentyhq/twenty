import { useContext } from 'react';

import {
  CampaignContextProps,
  CampaignMultiStepContext,
} from '~/pages/campaigns/CampaignContext';

export const useCampaign = (): CampaignContextProps => {
  const context = useContext(CampaignMultiStepContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};
