import { createContext } from 'react';
import { type Location } from 'react-router-dom';

export const MainSurfaceLocationContext = createContext<Location | null>(null);
