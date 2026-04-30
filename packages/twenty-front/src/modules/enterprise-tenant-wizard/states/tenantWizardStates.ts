import { atom } from 'jotai';

import { WizardStepData } from '../types/wizard.types';

export const wizardStepsState = atom<WizardStepData[]>([]);

export const tenantWizardLoadingState = atom<boolean>(false);

export const selectedWizardStepIdState = atom<string | null>(null);

export const tenantWizardFilterState = atom<string>('all');
