import { createContext } from 'react';

export type WorkspaceSurfaceHeaderPortalContextValue = {
  title: HTMLElement | null;
  actions: HTMLElement | null;
};

export const WorkspaceSurfaceHeaderPortalContext =
  createContext<WorkspaceSurfaceHeaderPortalContextValue>({
    title: null,
    actions: null,
  });
