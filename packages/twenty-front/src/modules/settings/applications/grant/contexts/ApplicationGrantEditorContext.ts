import { createContext } from 'react';

export type ApplicationGrantEditorContextValue = {
  applicationId: string;
  applicationName: string;
  lockedObjectMetadataIds: Set<string>;
};

// Set when the role editor edits an application grant, so it links and words things for the app
export const ApplicationGrantEditorContext =
  createContext<ApplicationGrantEditorContextValue | null>(null);
