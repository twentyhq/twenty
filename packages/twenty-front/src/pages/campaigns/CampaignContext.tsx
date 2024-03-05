import { createContext, useState } from 'react';

import { App } from '~/App';
export type CampaignContextProps = {
  currentStep: number;
  setCurrentStep: {};

  campaignData: {};

  setCampaignData: {};
};

export const CampaignMultiStepContext =
  createContext<CampaignContextProps | null>(null);

const CampaignContext = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({});

  return (
    <div>
      <CampaignMultiStepContext.Provider
        value={{
          currentStep,
          setCurrentStep,
          campaignData,
          setCampaignData,
        }}
      >
        <App />
      </CampaignMultiStepContext.Provider>
    </div>
  );
};

export default CampaignContext;
