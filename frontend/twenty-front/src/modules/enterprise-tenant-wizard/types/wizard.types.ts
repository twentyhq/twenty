export type WizardStepStatus = 'pending' | 'active' | 'completed' | 'skipped';

export type WizardStepData = {
  id: string;
  order: number;
  title: string;
  description: string;
  status: WizardStepStatus;
  isOptional: boolean;
};

export type IndustryTemplateData = {
  id: string;
  name: string;
  industry: string;
  description: string;
  modules: string[];
  previewImage: string;
  popularity: number;
};

export type ValidationCheckData = {
  id: string;
  label: string;
  category: 'required' | 'recommended' | 'optional';
  isPassing: boolean;
  message: string;
};
