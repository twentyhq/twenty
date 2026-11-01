import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { createContext } from 'react';
import { type ObjectPermissionAction } from 'twenty-shared/application';

export type ApplicationGrantEditorContextValue = {
  applicationName: string;
  lockedActionsByObjectMetadataId: Map<string, ObjectPermissionAction[]>;
  editorBreadcrumbLinks: BreadcrumbProps['links'];
  editorPath: string;
  addObjectPath: string;
  getObjectPath: (objectMetadataId: string) => string;
};

// Set when the role editor edits an application grant, at install or in the app's Access tab
export const ApplicationGrantEditorContext =
  createContext<ApplicationGrantEditorContextValue | null>(null);
