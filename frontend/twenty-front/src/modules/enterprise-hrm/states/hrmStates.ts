import { atom } from 'jotai';

import { EmployeeData } from '../types/hrm.types';

export const employeesState = atom<EmployeeData[]>([]);

export const hrmLoadingState = atom<boolean>(false);

export const selectedEmployeeIdState = atom<string | null>(null);
