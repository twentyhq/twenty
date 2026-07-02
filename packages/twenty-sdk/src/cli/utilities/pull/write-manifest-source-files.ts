import { rm, writeFile } from 'node:fs/promises';
import path from 'path';

import {
  type ApplicationManifest,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { kebabCase } from '@/cli/utilities/string/kebab-case';

type DefineFileConfig = {
  definer: string;
  enums?: Record<string, string>;
};

const INLINE_ARRAY_MAX_LENGTH = 80;

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entity';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEntityArray = (value: unknown[]): value is Record<string, unknown>[] =>
  value.length > 0 &&
  value.every(
    (item) => isPlainObject(item) && isDefined(item.universalIdentifier),
  );

const isPrimitiveArray = (value: unknown[]): boolean =>
  value.every((item) => !isPlainObject(item) && !Array.isArray(item));

const renderValue = ({
  value,
  key,
  config,
  usedEnums,
  level,
}: {
  value: unknown;
  key: string;
  config: DefineFileConfig;
  usedEnums: Set<string>;
  level: number;
}): string => {
  const enumName = config.enums?.[key];

  if (isDefined(enumName) && typeof value === 'string') {
    usedEnums.add(enumName);

    return `${enumName}.${value}`;
  }

  if (Array.isArray(value)) {
    if (isEntityArray(value)) {
      return renderMultilineArray({
        items: value.map((item) =>
          renderObjectLiteral({ node: item, config, usedEnums, level: level + 1 }),
        ),
        level,
      });
    }

    const inline = JSON.stringify(value);

    if (inline.length > INLINE_ARRAY_MAX_LENGTH && isPrimitiveArray(value)) {
      return renderMultilineArray({
        items: value.map((item) => JSON.stringify(item)),
        level,
      });
    }

    return inline;
  }

  return JSON.stringify(value);
};

const renderMultilineArray = ({
  items,
  level,
}: {
  items: string[];
  level: number;
}): string => {
  const itemIndent = '  '.repeat(level + 1);
  const lines = items.map((item) => `${itemIndent}${item},`);

  return `[\n${lines.join('\n')}\n${'  '.repeat(level)}]`;
};

const renderObjectLiteral = ({
  node,
  config,
  usedEnums,
  level,
}: {
  node: Record<string, unknown>;
  config: DefineFileConfig;
  usedEnums: Set<string>;
  level: number;
}): string => {
  const propertyIndent = '  '.repeat(level + 1);
  const lines = Object.entries(node)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => {
      const renderedValue = renderValue({
        value,
        key,
        config,
        usedEnums,
        level: level + 1,
      });

      return `${propertyIndent}${key}: ${renderedValue},`;
    });

  return `{\n${lines.join('\n')}\n${'  '.repeat(level)}}`;
};

const renderDefineFile = (
  config: DefineFileConfig,
  node: Record<string, unknown>,
): string => {
  const usedEnums = new Set<string>();
  const body = Object.entries(node)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => {
      const renderedValue = renderValue({
        value,
        key,
        config,
        usedEnums,
        level: 1,
      });

      return `  ${key}: ${renderedValue},`;
    });

  const members = [config.definer, ...usedEnums];

  return `import { ${members.join(', ')} } from 'twenty-sdk/define';\n\nexport default ${config.definer}({\n${body.join('\n')}\n});\n`;
};

const OBJECT_CONFIG: DefineFileConfig = {
  definer: 'defineObject',
  enums: { type: 'FieldType' },
};

const STANDALONE_FIELD_CONFIG: DefineFileConfig = {
  definer: 'defineField',
  enums: { type: 'FieldType' },
};

const VIEW_CONFIG: DefineFileConfig = {
  definer: 'defineView',
  enums: {
    type: 'ViewType',
    key: 'ViewKey',
    visibility: 'ViewVisibility',
    openRecordIn: 'ViewOpenRecordIn',
    kanbanAggregateOperation: 'AggregateOperations',
    aggregateOperation: 'AggregateOperations',
    calendarLayout: 'ViewCalendarLayout',
  },
};

const NAVIGATION_MENU_ITEM_CONFIG: DefineFileConfig = {
  definer: 'defineNavigationMenuItem',
  enums: { type: 'NavigationMenuItemType' },
};

const PAGE_LAYOUT_CONFIG: DefineFileConfig = {
  definer: 'definePageLayout',
  enums: { layoutMode: 'PageLayoutTabLayoutMode' },
};

const PERMISSION_FLAG_CONFIG: DefineFileConfig = {
  definer: 'definePermissionFlag',
};

const DEFAULT_ROLE_CONFIG: DefineFileConfig = {
  definer: 'defineApplicationRole',
};

const ROLE_CONFIG: DefineFileConfig = { definer: 'defineRole' };

const APPLICATION_CONFIG: DefineFileConfig = { definer: 'defineApplication' };

const APPLICATION_SOURCE_KEYS = [
  'universalIdentifier',
  'displayName',
  'description',
  'logoUrl',
];

const toRenderableApplication = (
  applicationManifest: ApplicationManifest,
): Record<string, unknown> =>
  Object.fromEntries(
    APPLICATION_SOURCE_KEYS.map((key) => [
      key,
      applicationManifest[key as keyof ApplicationManifest],
    ]),
  );

const MANAGED_FOLDERS = [
  'roles',
  'objects',
  'permission-flags',
  'fields',
  'views',
  'page-layouts',
  'navigation-menu-items',
];

const writeEntityFiles = async <
  TEntity extends { universalIdentifier: string },
>({
  srcDir,
  folder,
  entities,
  config,
  getFileName,
  writtenFiles,
}: {
  srcDir: string;
  folder: string;
  entities: TEntity[];
  config: DefineFileConfig;
  getFileName: (entity: TEntity) => string;
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

    await writeFile(
      filePath,
      renderDefineFile(config, entity as Record<string, unknown>),
    );
    writtenFiles.push(filePath);
  }
};

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
    renderDefineFile(
      APPLICATION_CONFIG,
      toRenderableApplication(manifest.application),
    ),
  );
  writtenFiles.push(applicationConfigPath);

  const defaultRole = manifest.roles.find(
    (role) =>
      role.universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier,
  );

  if (isDefined(defaultRole)) {
    const defaultRolePath = path.join(srcDir, 'default-role.ts');

    await writeFile(
      defaultRolePath,
      renderDefineFile(
        DEFAULT_ROLE_CONFIG,
        defaultRole as unknown as Record<string, unknown>,
      ),
    );
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
    config: ROLE_CONFIG,
    getFileName: (role) => slugify(role.label),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'objects',
    entities: manifest.objects,
    config: OBJECT_CONFIG,
    getFileName: (object) => kebabCase(object.nameSingular),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'permission-flags',
    entities: manifest.permissionFlags,
    config: PERMISSION_FLAG_CONFIG,
    getFileName: (permissionFlag) => slugify(permissionFlag.key),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'fields',
    entities: manifest.fields,
    config: STANDALONE_FIELD_CONFIG,
    getFileName: (field) =>
      `${slugify(field.name)}-${field.universalIdentifier.slice(0, 8)}`,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'views',
    entities: manifest.views,
    config: VIEW_CONFIG,
    getFileName: (view) => slugify(view.name),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'page-layouts',
    entities: manifest.pageLayouts,
    config: PAGE_LAYOUT_CONFIG,
    getFileName: (pageLayout) => slugify(pageLayout.name),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'navigation-menu-items',
    entities: manifest.navigationMenuItems,
    config: NAVIGATION_MENU_ITEM_CONFIG,
    getFileName: (navigationMenuItem) =>
      isDefined(navigationMenuItem.name)
        ? slugify(navigationMenuItem.name)
        : `navigation-menu-item-${navigationMenuItem.universalIdentifier.slice(0, 8)}`,
    writtenFiles,
  });

  return writtenFiles;
};
