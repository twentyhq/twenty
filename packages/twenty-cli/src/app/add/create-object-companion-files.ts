import { randomUUID } from 'node:crypto';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { ViewType } from 'twenty-shared/types';

import { getNavigationMenuItemBaseFile } from '@/app/add/entity-navigation-menu-item-template';
import { getRecordPageLayoutBaseFile } from '@/app/add/entity-record-page-layout-template';
import { getViewBaseFile } from '@/app/add/entity-view-template';
import { type AppAddFile } from '@/app/add/types/app-add-file.type';

export const createObjectCompanionFiles = ({
  name,
  labelSingular,
  objectUniversalIdentifier,
  nameFieldUniversalIdentifier,
  applicationUniversalIdentifier,
  createView,
  createNavigationMenuItem,
  createPageLayout,
}: {
  name: string;
  labelSingular: string;
  objectUniversalIdentifier: string;
  nameFieldUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  createView: boolean;
  createNavigationMenuItem: boolean;
  createPageLayout: boolean;
}): AppAddFile[] => {
  const files: AppAddFile[] = [];

  if (createView) {
    files.push({
      path: `src/views/all-${name}.ts`,
      content: getViewBaseFile({
        name: `all-${name}`,
        objectUniversalIdentifier,
        fieldUniversalIdentifiers: [nameFieldUniversalIdentifier],
      }),
    });
  }

  if (createNavigationMenuItem) {
    files.push({
      path: `src/navigation-menu-items/${name}.ts`,
      content: getNavigationMenuItemBaseFile({
        name,
        objectUniversalIdentifier,
      }),
    });
  }

  if (createPageLayout) {
    const fieldsWidgetViewUniversalIdentifier = randomUUID();
    const fieldUniversalIdentifiers = [
      nameFieldUniversalIdentifier,
      ...['createdAt', 'updatedAt', 'createdBy', 'updatedBy'].map((fieldName) =>
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: fieldName,
        }),
      ),
    ];

    files.push(
      {
        path: `src/views/${name}-record-page-fields.ts`,
        content: getViewBaseFile({
          name: `${name}-record-page-fields`,
          universalIdentifier: fieldsWidgetViewUniversalIdentifier,
          objectUniversalIdentifier,
          type: ViewType.FIELDS_WIDGET,
          fieldUniversalIdentifiers,
        }),
      },
      {
        path: `src/page-layouts/${name}-record-page-layout.ts`,
        content: getRecordPageLayoutBaseFile({
          objectLabelSingular: labelSingular,
          objectUniversalIdentifier,
          fieldsWidgetViewUniversalIdentifier,
        }),
      },
    );
  }

  return files;
};
