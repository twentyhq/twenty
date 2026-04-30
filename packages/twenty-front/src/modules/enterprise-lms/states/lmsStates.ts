import { atom } from 'jotai';

import { CourseData } from '../types/lms.types';

export const coursesState = atom<CourseData[]>([]);

export const lmsLoadingState = atom<boolean>(false);

export const selectedCourseIdState = atom<string | null>(null);

export const lmsFilterState = atom<string>('all');
