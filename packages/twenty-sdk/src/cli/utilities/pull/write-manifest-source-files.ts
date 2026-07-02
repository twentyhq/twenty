import { rm, writeFile } from 'node:fs/promises';
import path from 'path';

import {
  type ApplicationManifest,
  type FieldManifest,
  type Manifest,
  type NavigationMenuItemManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
  type PermissionFlagManifest,
  type RoleManifest,
  type ViewFieldManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { kebabCase } from '@/cli/utilities/string/kebab-case';

const ROLE_BOOLEAN_KEYS = [
  'canUpdateAllSettings',
  'canAccessAllTools',
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
  'canBeAssignedToUsers',
  'canBeAssignedToAgents',
  'canBeAssignedToApiKeys',
] as const;

const serialize = (value: unknown): string => JSON.stringify(value);

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entity';

const enumRef = (
  usedEnums: Set<string>,
  enumName: string,
  value: string,
): string => {
  usedEnums.add(enumName);

  return `${enumName}.${value}`;
};

const importLine = (definer: string, usedEnums: Set<string>): string => {
  const members = [definer, ...usedEnums];

  return `import { ${members.join(', ')} } from 'twenty-sdk/define';`;
};

const renderArrayBlock = (items: string[], indent: string): string =>
  items.length === 0 ? '[],' : `[\n${items.join('\n')}\n${indent}],`;

const fieldConfigLines = (
  field: ObjectFieldManifest,
  indent: string,
): string[] => {
  const relation = field as {
    relationTargetObjectMetadataUniversalIdentifier?: string;
    relationTargetFieldMetadataUniversalIdentifier?: string;
    morphId?: string;
  };

  const lines: string[] = [
    `${indent}universalIdentifier: ${serialize(field.universalIdentifier)},`,
    `${indent}type: FieldType.${field.type},`,
    `${indent}name: ${serialize(field.name)},`,
    `${indent}label: ${serialize(field.label)},`,
  ];

  if (isDefined(field.description)) {
    lines.push(`${indent}description: ${serialize(field.description)},`);
  }
  if (isDefined(field.icon)) {
    lines.push(`${indent}icon: ${serialize(field.icon)},`);
  }
  if (isDefined(field.defaultValue)) {
    lines.push(`${indent}defaultValue: ${serialize(field.defaultValue)},`);
  }
  if (isDefined(field.options)) {
    lines.push(`${indent}options: ${serialize(field.options)},`);
  }
  if (isDefined(field.universalSettings)) {
    lines.push(
      `${indent}universalSettings: ${serialize(field.universalSettings)},`,
    );
  }
  if (isDefined(field.isNullable)) {
    lines.push(`${indent}isNullable: ${serialize(field.isNullable)},`);
  }
  if (isDefined(field.isUIEditable)) {
    lines.push(`${indent}isUIEditable: ${serialize(field.isUIEditable)},`);
  }
  if (isDefined(field.isUnique)) {
    lines.push(`${indent}isUnique: ${serialize(field.isUnique)},`);
  }
  if (isDefined(field.isActive)) {
    lines.push(`${indent}isActive: ${serialize(field.isActive)},`);
  }
  if (isDefined(relation.relationTargetObjectMetadataUniversalIdentifier)) {
    lines.push(
      `${indent}relationTargetObjectMetadataUniversalIdentifier: ${serialize(relation.relationTargetObjectMetadataUniversalIdentifier)},`,
    );
  }
  if (isDefined(relation.relationTargetFieldMetadataUniversalIdentifier)) {
    lines.push(
      `${indent}relationTargetFieldMetadataUniversalIdentifier: ${serialize(relation.relationTargetFieldMetadataUniversalIdentifier)},`,
    );
  }
  if (isDefined(relation.morphId)) {
    lines.push(`${indent}morphId: ${serialize(relation.morphId)},`);
  }

  return lines;
};

const renderField = (field: ObjectFieldManifest): string =>
  `    {\n${fieldConfigLines(field, '      ').join('\n')}\n    },`;

const renderStandaloneFieldFile = (field: FieldManifest): string => {
  const lines = fieldConfigLines(field, '  ');

  lines.push(
    `  objectUniversalIdentifier: ${serialize(field.objectUniversalIdentifier)},`,
  );

  return `import { defineField, FieldType } from 'twenty-sdk/define';\n\nexport default defineField({\n${lines.join('\n')}\n});\n`;
};

const renderObjectFile = (objectManifest: ObjectManifest): string => {
  const lines: string[] = [
    `  universalIdentifier: ${serialize(objectManifest.universalIdentifier)},`,
    `  nameSingular: ${serialize(objectManifest.nameSingular)},`,
    `  namePlural: ${serialize(objectManifest.namePlural)},`,
    `  labelSingular: ${serialize(objectManifest.labelSingular)},`,
    `  labelPlural: ${serialize(objectManifest.labelPlural)},`,
  ];

  if (isDefined(objectManifest.description)) {
    lines.push(`  description: ${serialize(objectManifest.description)},`);
  }
  if (isDefined(objectManifest.icon)) {
    lines.push(`  icon: ${serialize(objectManifest.icon)},`);
  }
  if (isDefined(objectManifest.isSearchable)) {
    lines.push(`  isSearchable: ${serialize(objectManifest.isSearchable)},`);
  }
  if (isDefined(objectManifest.isUICreatable)) {
    lines.push(`  isUICreatable: ${serialize(objectManifest.isUICreatable)},`);
  }
  if (isDefined(objectManifest.isUIEditable)) {
    lines.push(`  isUIEditable: ${serialize(objectManifest.isUIEditable)},`);
  }
  if (isDefined(objectManifest.isActive)) {
    lines.push(`  isActive: ${serialize(objectManifest.isActive)},`);
  }

  lines.push(
    `  labelIdentifierFieldMetadataUniversalIdentifier: ${serialize(objectManifest.labelIdentifierFieldMetadataUniversalIdentifier)},`,
  );

  const fields = objectManifest.fields.map(renderField);

  lines.push(`  fields: ${renderArrayBlock(fields, '  ')}`);

  return `import { defineObject, FieldType } from 'twenty-sdk/define';\n\nexport default defineObject({\n${lines.join('\n')}\n});\n`;
};

const renderApplicationConfigFile = (
  applicationManifest: ApplicationManifest,
): string => {
  const lines: string[] = [
    `  universalIdentifier: ${serialize(applicationManifest.universalIdentifier)},`,
    `  displayName: ${serialize(applicationManifest.displayName)},`,
    `  description: ${serialize(applicationManifest.description)},`,
  ];

  if (isDefined(applicationManifest.logoUrl)) {
    lines.push(`  logoUrl: ${serialize(applicationManifest.logoUrl)},`);
  }

  return `import { defineApplication } from 'twenty-sdk/define';\n\nexport default defineApplication({\n${lines.join('\n')}\n});\n`;
};

const renderRoleConfigLines = (roleManifest: RoleManifest): string[] => {
  const lines: string[] = [
    `  universalIdentifier: ${serialize(roleManifest.universalIdentifier)},`,
    `  label: ${serialize(roleManifest.label)},`,
  ];

  if (isDefined(roleManifest.description)) {
    lines.push(`  description: ${serialize(roleManifest.description)},`);
  }
  if (isDefined(roleManifest.icon)) {
    lines.push(`  icon: ${serialize(roleManifest.icon)},`);
  }

  for (const key of ROLE_BOOLEAN_KEYS) {
    const value = roleManifest[key];

    if (isDefined(value)) {
      lines.push(`  ${key}: ${serialize(value)},`);
    }
  }

  if (isNonEmptyArray(roleManifest.permissionFlagUniversalIdentifiers)) {
    const flags = roleManifest.permissionFlagUniversalIdentifiers
      .map((flag) => `    ${serialize(flag)},`)
      .join('\n');

    lines.push(`  permissionFlagUniversalIdentifiers: [\n${flags}\n  ],`);
  }

  return lines;
};

const renderDefaultRoleFile = (roleManifest: RoleManifest): string =>
  `import { defineApplicationRole } from 'twenty-sdk/define';\n\nexport default defineApplicationRole({\n${renderRoleConfigLines(roleManifest).join('\n')}\n});\n`;

const renderRoleFile = (roleManifest: RoleManifest): string =>
  `import { defineRole } from 'twenty-sdk/define';\n\nexport default defineRole({\n${renderRoleConfigLines(roleManifest).join('\n')}\n});\n`;

const renderViewField = (
  usedEnums: Set<string>,
  viewField: ViewFieldManifest,
): string => {
  const lines: string[] = [
    `      universalIdentifier: ${serialize(viewField.universalIdentifier)},`,
    `      fieldMetadataUniversalIdentifier: ${serialize(viewField.fieldMetadataUniversalIdentifier)},`,
    `      position: ${serialize(viewField.position)},`,
  ];

  if (isDefined(viewField.isVisible)) {
    lines.push(`      isVisible: ${serialize(viewField.isVisible)},`);
  }
  if (isDefined(viewField.size)) {
    lines.push(`      size: ${serialize(viewField.size)},`);
  }
  if (isDefined(viewField.aggregateOperation)) {
    lines.push(
      `      aggregateOperation: ${enumRef(usedEnums, 'AggregateOperations', viewField.aggregateOperation)},`,
    );
  }
  if (isDefined(viewField.viewFieldGroupUniversalIdentifier)) {
    lines.push(
      `      viewFieldGroupUniversalIdentifier: ${serialize(viewField.viewFieldGroupUniversalIdentifier)},`,
    );
  }
  if (isDefined(viewField.isActive)) {
    lines.push(`      isActive: ${serialize(viewField.isActive)},`);
  }

  return `    {\n${lines.join('\n')}\n    },`;
};

const renderViewFile = (viewManifest: ViewManifest): string => {
  const usedEnums = new Set<string>();
  const lines: string[] = [
    `  universalIdentifier: ${serialize(viewManifest.universalIdentifier)},`,
    `  name: ${serialize(viewManifest.name)},`,
    `  objectUniversalIdentifier: ${serialize(viewManifest.objectUniversalIdentifier)},`,
  ];

  if (isDefined(viewManifest.type)) {
    lines.push(`  type: ${enumRef(usedEnums, 'ViewType', viewManifest.type)},`);
  }
  if (isDefined(viewManifest.key)) {
    lines.push(`  key: ${enumRef(usedEnums, 'ViewKey', viewManifest.key)},`);
  }
  if (isDefined(viewManifest.icon)) {
    lines.push(`  icon: ${serialize(viewManifest.icon)},`);
  }
  if (isDefined(viewManifest.position)) {
    lines.push(`  position: ${serialize(viewManifest.position)},`);
  }
  if (isDefined(viewManifest.isCompact)) {
    lines.push(`  isCompact: ${serialize(viewManifest.isCompact)},`);
  }
  if (isDefined(viewManifest.visibility)) {
    lines.push(
      `  visibility: ${enumRef(usedEnums, 'ViewVisibility', viewManifest.visibility)},`,
    );
  }
  if (isDefined(viewManifest.openRecordIn)) {
    lines.push(
      `  openRecordIn: ${enumRef(usedEnums, 'ViewOpenRecordIn', viewManifest.openRecordIn)},`,
    );
  }
  if (isDefined(viewManifest.mainGroupByFieldMetadataUniversalIdentifier)) {
    lines.push(
      `  mainGroupByFieldMetadataUniversalIdentifier: ${serialize(viewManifest.mainGroupByFieldMetadataUniversalIdentifier)},`,
    );
  }
  if (isDefined(viewManifest.shouldHideEmptyGroups)) {
    lines.push(
      `  shouldHideEmptyGroups: ${serialize(viewManifest.shouldHideEmptyGroups)},`,
    );
  }
  if (isDefined(viewManifest.anyFieldFilterValue)) {
    lines.push(
      `  anyFieldFilterValue: ${serialize(viewManifest.anyFieldFilterValue)},`,
    );
  }
  if (isDefined(viewManifest.kanbanColumnWidth)) {
    lines.push(
      `  kanbanColumnWidth: ${serialize(viewManifest.kanbanColumnWidth)},`,
    );
  }
  if (isDefined(viewManifest.kanbanAggregateOperation)) {
    lines.push(
      `  kanbanAggregateOperation: ${enumRef(usedEnums, 'AggregateOperations', viewManifest.kanbanAggregateOperation)},`,
    );
  }
  if (
    isDefined(
      viewManifest.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    )
  ) {
    lines.push(
      `  kanbanAggregateOperationFieldMetadataUniversalIdentifier: ${serialize(viewManifest.kanbanAggregateOperationFieldMetadataUniversalIdentifier)},`,
    );
  }
  if (isDefined(viewManifest.calendarLayout)) {
    lines.push(
      `  calendarLayout: ${enumRef(usedEnums, 'ViewCalendarLayout', viewManifest.calendarLayout)},`,
    );
  }
  if (isDefined(viewManifest.calendarFieldMetadataUniversalIdentifier)) {
    lines.push(
      `  calendarFieldMetadataUniversalIdentifier: ${serialize(viewManifest.calendarFieldMetadataUniversalIdentifier)},`,
    );
  }
  if (isDefined(viewManifest.isActive)) {
    lines.push(`  isActive: ${serialize(viewManifest.isActive)},`);
  }

  const fields = (viewManifest.fields ?? []).map((field) =>
    renderViewField(usedEnums, field),
  );

  lines.push(`  fields: ${renderArrayBlock(fields, '  ')}`);

  return `${importLine('defineView', usedEnums)}\n\nexport default defineView({\n${lines.join('\n')}\n});\n`;
};

const renderNavigationMenuItemFile = (
  navigationMenuItemManifest: NavigationMenuItemManifest,
): string => {
  const usedEnums = new Set<string>();
  const lines: string[] = [
    `  universalIdentifier: ${serialize(navigationMenuItemManifest.universalIdentifier)},`,
    `  type: ${enumRef(usedEnums, 'NavigationMenuItemType', navigationMenuItemManifest.type)},`,
    `  position: ${serialize(navigationMenuItemManifest.position)},`,
  ];

  if (isDefined(navigationMenuItemManifest.name)) {
    lines.push(`  name: ${serialize(navigationMenuItemManifest.name)},`);
  }
  if (isDefined(navigationMenuItemManifest.icon)) {
    lines.push(`  icon: ${serialize(navigationMenuItemManifest.icon)},`);
  }
  if (isDefined(navigationMenuItemManifest.color)) {
    lines.push(`  color: ${serialize(navigationMenuItemManifest.color)},`);
  }
  if (isDefined(navigationMenuItemManifest.viewUniversalIdentifier)) {
    lines.push(
      `  viewUniversalIdentifier: ${serialize(navigationMenuItemManifest.viewUniversalIdentifier)},`,
    );
  }
  if (isDefined(navigationMenuItemManifest.targetObjectUniversalIdentifier)) {
    lines.push(
      `  targetObjectUniversalIdentifier: ${serialize(navigationMenuItemManifest.targetObjectUniversalIdentifier)},`,
    );
  }
  if (isDefined(navigationMenuItemManifest.pageLayoutUniversalIdentifier)) {
    lines.push(
      `  pageLayoutUniversalIdentifier: ${serialize(navigationMenuItemManifest.pageLayoutUniversalIdentifier)},`,
    );
  }
  if (isDefined(navigationMenuItemManifest.link)) {
    lines.push(`  link: ${serialize(navigationMenuItemManifest.link)},`);
  }
  if (isDefined(navigationMenuItemManifest.folderUniversalIdentifier)) {
    lines.push(
      `  folderUniversalIdentifier: ${serialize(navigationMenuItemManifest.folderUniversalIdentifier)},`,
    );
  }

  return `${importLine('defineNavigationMenuItem', usedEnums)}\n\nexport default defineNavigationMenuItem({\n${lines.join('\n')}\n});\n`;
};

const renderPageLayoutWidget = (
  widget: PageLayoutWidgetManifest,
): string => {
  const lines: string[] = [
    `        universalIdentifier: ${serialize(widget.universalIdentifier)},`,
    `        title: ${serialize(widget.title)},`,
    `        type: ${serialize(widget.type)},`,
  ];

  if (isDefined(widget.objectUniversalIdentifier)) {
    lines.push(
      `        objectUniversalIdentifier: ${serialize(widget.objectUniversalIdentifier)},`,
    );
  }
  if (isDefined(widget.gridPosition)) {
    lines.push(`        gridPosition: ${serialize(widget.gridPosition)},`);
  }
  if (isDefined(widget.conditionalDisplay)) {
    lines.push(
      `        conditionalDisplay: ${serialize(widget.conditionalDisplay)},`,
    );
  }
  if (isDefined(widget.isActive)) {
    lines.push(`        isActive: ${serialize(widget.isActive)},`);
  }

  lines.push(`        configuration: ${serialize(widget.configuration)},`);

  return `      {\n${lines.join('\n')}\n      },`;
};

const renderPageLayoutTab = (
  usedEnums: Set<string>,
  tab: PageLayoutTabManifest,
): string => {
  const lines: string[] = [
    `      universalIdentifier: ${serialize(tab.universalIdentifier)},`,
    `      title: ${serialize(tab.title)},`,
    `      position: ${serialize(tab.position)},`,
  ];

  if (isDefined(tab.icon)) {
    lines.push(`      icon: ${serialize(tab.icon)},`);
  }
  if (isDefined(tab.layoutMode)) {
    lines.push(
      `      layoutMode: ${enumRef(usedEnums, 'PageLayoutTabLayoutMode', tab.layoutMode)},`,
    );
  }
  if (isDefined(tab.isActive)) {
    lines.push(`      isActive: ${serialize(tab.isActive)},`);
  }

  const widgets = (tab.widgets ?? []).map(renderPageLayoutWidget);

  lines.push(`      widgets: ${renderArrayBlock(widgets, '      ')}`);

  return `    {\n${lines.join('\n')}\n    },`;
};

const renderPageLayoutFile = (pageLayoutManifest: PageLayoutManifest): string => {
  const usedEnums = new Set<string>();
  const lines: string[] = [
    `  universalIdentifier: ${serialize(pageLayoutManifest.universalIdentifier)},`,
    `  name: ${serialize(pageLayoutManifest.name)},`,
  ];

  if (isDefined(pageLayoutManifest.type)) {
    lines.push(`  type: ${serialize(pageLayoutManifest.type)},`);
  }
  if (isDefined(pageLayoutManifest.objectUniversalIdentifier)) {
    lines.push(
      `  objectUniversalIdentifier: ${serialize(pageLayoutManifest.objectUniversalIdentifier)},`,
    );
  }
  if (
    isDefined(
      pageLayoutManifest.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
    )
  ) {
    lines.push(
      `  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: ${serialize(pageLayoutManifest.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier)},`,
    );
  }

  const tabs = (pageLayoutManifest.tabs ?? []).map((tab) =>
    renderPageLayoutTab(usedEnums, tab),
  );

  lines.push(`  tabs: ${renderArrayBlock(tabs, '  ')}`);

  return `${importLine('definePageLayout', usedEnums)}\n\nexport default definePageLayout({\n${lines.join('\n')}\n});\n`;
};

const renderPermissionFlagFile = (
  permissionFlagManifest: PermissionFlagManifest,
): string => {
  const lines: string[] = [
    `  universalIdentifier: ${serialize(permissionFlagManifest.universalIdentifier)},`,
    `  key: ${serialize(permissionFlagManifest.key)},`,
    `  label: ${serialize(permissionFlagManifest.label)},`,
  ];

  if (isDefined(permissionFlagManifest.description)) {
    lines.push(`  description: ${serialize(permissionFlagManifest.description)},`);
  }
  if (isDefined(permissionFlagManifest.icon)) {
    lines.push(`  icon: ${serialize(permissionFlagManifest.icon)},`);
  }

  return `import { definePermissionFlag } from 'twenty-sdk/define';\n\nexport default definePermissionFlag({\n${lines.join('\n')}\n});\n`;
};

const writeEntityFiles = async <
  TEntity extends { universalIdentifier: string },
>({
  srcDir,
  folder,
  entities,
  getFileName,
  render,
  writtenFiles,
}: {
  srcDir: string;
  folder: string;
  entities: TEntity[];
  getFileName: (entity: TEntity) => string;
  render: (entity: TEntity) => string;
  writtenFiles: string[];
}): Promise<void> => {
  if (entities.length === 0) {
    return;
  }

  const dir = path.join(srcDir, folder);

  await ensureDir(dir);

  const usedFileNames = new Set<string>();

  for (const entity of entities) {
    const baseFileName = getFileName(entity);
    const fileName = usedFileNames.has(baseFileName)
      ? `${baseFileName}-${entity.universalIdentifier.slice(0, 8)}`
      : baseFileName;

    usedFileNames.add(fileName);

    const filePath = path.join(dir, `${fileName}.ts`);

    await writeFile(filePath, render(entity));
    writtenFiles.push(filePath);
  }
};

const MANAGED_FOLDERS = [
  'roles',
  'objects',
  'permission-flags',
  'fields',
  'views',
  'page-layouts',
  'navigation-menu-items',
];

export const writeManifestSourceFiles = async ({
  outPath,
  manifest,
}: {
  outPath: string;
  manifest: Manifest;
}): Promise<string[]> => {
  const writtenFiles: string[] = [];
  const srcDir = path.join(outPath, 'src');

  await ensureDir(srcDir);

  for (const folder of MANAGED_FOLDERS) {
    await rm(path.join(srcDir, folder), { recursive: true, force: true });
  }

  await rm(path.join(srcDir, 'default-role.ts'), { force: true });

  const applicationConfigPath = path.join(srcDir, 'application-config.ts');

  await writeFile(
    applicationConfigPath,
    renderApplicationConfigFile(manifest.application),
  );
  writtenFiles.push(applicationConfigPath);

  const defaultRole = manifest.roles.find(
    (role) =>
      role.universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier,
  );

  if (isDefined(defaultRole)) {
    const defaultRolePath = path.join(srcDir, 'default-role.ts');

    await writeFile(defaultRolePath, renderDefaultRoleFile(defaultRole));
    writtenFiles.push(defaultRolePath);
  }

  const nonDefaultRoles = manifest.roles.filter(
    (role) =>
      role.universalIdentifier !==
      manifest.application.defaultRoleUniversalIdentifier,
  );

  await writeEntityFiles({
    srcDir,
    folder: 'roles',
    entities: nonDefaultRoles,
    getFileName: (role) => slugify(role.label),
    render: renderRoleFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'objects',
    entities: manifest.objects,
    getFileName: (object) => kebabCase(object.nameSingular),
    render: renderObjectFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'permission-flags',
    entities: manifest.permissionFlags,
    getFileName: (permissionFlag) => slugify(permissionFlag.key),
    render: renderPermissionFlagFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'fields',
    entities: manifest.fields,
    getFileName: (field) =>
      `${slugify(field.name)}-${field.universalIdentifier.slice(0, 8)}`,
    render: renderStandaloneFieldFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'views',
    entities: manifest.views,
    getFileName: (view) => slugify(view.name),
    render: renderViewFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'page-layouts',
    entities: manifest.pageLayouts,
    getFileName: (pageLayout) => slugify(pageLayout.name),
    render: renderPageLayoutFile,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'navigation-menu-items',
    entities: manifest.navigationMenuItems,
    getFileName: (navigationMenuItem) =>
      isDefined(navigationMenuItem.name)
        ? slugify(navigationMenuItem.name)
        : `navigation-menu-item-${navigationMenuItem.universalIdentifier.slice(0, 8)}`,
    render: renderNavigationMenuItemFile,
    writtenFiles,
  });

  return writtenFiles;
};
