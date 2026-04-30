import { atom } from 'jotai';

import { Incident } from '../types/incidents.types';

export const incidentsState = atom<Incident[]>([]);

export const incidentsLoadingState = atom<boolean>(false);

export const selectedIncidentIdState = atom<string | null>(null);

export const incidentsFilterState = atom<string>('all');
