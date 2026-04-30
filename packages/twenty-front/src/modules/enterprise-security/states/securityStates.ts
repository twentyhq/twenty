import { atom } from 'jotai';

import { DeviceSession } from '../types/security.types';

export const deviceSessionsState = atom<DeviceSession[]>([]);

export const securityLoadingState = atom<boolean>(false);

export const selectedDeviceSessionIdState = atom<string | null>(null);

export const securityFilterState = atom<string>('all');
