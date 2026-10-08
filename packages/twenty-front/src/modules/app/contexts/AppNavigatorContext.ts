import { createContext } from 'react';
import { type Navigator } from 'react-router-dom';

export type AppNavigator = Pick<Navigator, 'push' | 'replace'>;

export const AppNavigatorContext = createContext<AppNavigator | null>(null);
