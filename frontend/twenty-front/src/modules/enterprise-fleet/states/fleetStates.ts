import { atom } from 'jotai';

import { VehicleData } from '../types/fleet.types';

export const vehiclesState = atom<VehicleData[]>([]);

export const fleetLoadingState = atom<boolean>(false);

export const selectedVehicleIdState = atom<string | null>(null);
