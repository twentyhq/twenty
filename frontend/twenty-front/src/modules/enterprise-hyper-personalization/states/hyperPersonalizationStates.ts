import { atom } from 'jotai';

import { PersonalizationRuleData } from '../types/personalization.types';

export const personalizationRulesState = atom<PersonalizationRuleData[]>([]);

export const hyperPersonalizationLoadingState = atom<boolean>(false);

export const selectedPersonalizationRuleIdState = atom<string | null>(null);

export const hyperPersonalizationFilterState = atom<string>('all');
