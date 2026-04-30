import { atom } from 'jotai';

import { TicketData } from '../types/helpdesk.types';

export const ticketsState = atom<TicketData[]>([]);

export const ticketsLoadingState = atom<boolean>(false);

export const selectedTicketIdState = atom<string | null>(null);
