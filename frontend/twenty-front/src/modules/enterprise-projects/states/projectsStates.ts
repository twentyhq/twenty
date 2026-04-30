import { atom } from 'jotai';

import { ProjectData } from '../types/project.types';

export const projectsState = atom<ProjectData[]>([]);

export const projectsLoadingState = atom<boolean>(false);

export const selectedProjectIdState = atom<string | null>(null);
