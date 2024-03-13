import { createContext, useState } from 'react';

import { App } from '~/App';

type CampaignData = {
  campaignName: string;
  campaignDescription: string;
  specialtyType: string;
  subSpecialtyType: string;
  leads: string;
};
export type CampaignContextProps = {
  currentStep: number;
  setCurrentStep: (step: number) => void;

  campaignData: any;

  setCampaignData: (data: any) => void;

  leadData: any;

  setLeadData: any;
};

export const CampaignMultiStepContext =
  createContext<CampaignContextProps | null>(null);

const CampaignContext = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [leadData, setLeadData] = useState();
  const [campaignData, setCampaignData] = useState({
    campaignName: '',
    campaignDescription: '',
    specialtyType: '',
    subSpecialtyType: '',
    leads: '',
    startDate: '',
    endDate: '',
  });

  return (
    <div>
      <CampaignMultiStepContext.Provider
        value={{
          currentStep,
          setCurrentStep,
          campaignData,
          setCampaignData,
          leadData,
          setLeadData,
        }}
      >
        <App />
      </CampaignMultiStepContext.Provider>
    </div>
  );
};

export default CampaignContext;
