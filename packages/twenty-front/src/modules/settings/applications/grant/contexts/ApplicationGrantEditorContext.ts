import { createContext } from 'react';

export type ApplicationGrantEditorContextValue = {
  applicationId: string;
  lockedObjectMetadataIds: Set<string>;
};

export const ApplicationGrantEditorContext =
  createContext<ApplicationGrantEditorContextValue | null>(null);
