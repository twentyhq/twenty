import { atom } from 'jotai';

import { EventData } from '../types/events.types';

export const eventsState = atom<EventData[]>([]);

export const eventsLoadingState = atom<boolean>(false);

export const selectedEventIdState = atom<string | null>(null);

export const eventsFilterState = atom<string>('all');
