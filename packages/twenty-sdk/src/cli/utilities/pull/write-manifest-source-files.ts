import { rm, writeFile } from 'node:fs/promises';
import path from 'path';

import {
  type ApplicationManifest,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { kebabCase } from '@/cli/utilities/string/kebab-case';

const INLINE_ARRAY_MAX_LENGTH = 80;

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entity';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isObjectArray = (value: unknown[]): value is Record<string, unknown>[] =>
  value.length > 0 && value.every(isPlainObject);

const isPrimitiveArray = (value: unknown[]): boolean =>
  value.every((item) => !isPlainObject(item) && !Array.isArray(item));

const renderKey = (key: string): string =>
  IDENTIFIER_PATTERN.test(key) ? key : JSON.stringify(key);

const renderValue = (value: unknown, level: number): string => {
  if (Array.isArray(value)) {
    if (isObjectArray(value)) {
      return renderMultilineArray({
        items: value.map((item) => renderObjectLiteral(item, level + 1)),
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

const renderObjectLiteral = (
  node: Record<string, unknown>,
  level: number,
): string => {
  const propertyIndent = '  '.repeat(level + 1);
  const lines = Object.entries(node)
    .filter(([, value]) => isDefined(value))
    .map(
      ([key, value]) =>
        `${propertyIndent}${renderKey(key)}: ${renderValue(value, level + 1)},`,
    );

  return `{\n${lines.join('\n')}\n${'  '.repeat(level)}}`;
};

const renderDefineFile = (
  definer: string,
  node: Record<string, unknown>,
): string => {
  const body = Object.entries(node)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `  ${renderKey(key)}: ${renderValue(value, 1)},`);

  return `import { ${definer} } from 'twenty-sdk/define';\n\nexport default ${definer}({\n${body.join('\n')}\n});\n`;
};

const toRenderableApplication = ({
  universalIdentifier,
  displayName,
  description,
  logoUrl,
}: ApplicationManifest): Record<string, unknown> => ({
  universalIdentifier,
  displayName,
  description,
  logoUrl,
});

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
  definer,
  getFileName,
  writtenFiles,
}: {
  srcDir: string;
  folder: string;
  entities: TEntity[];
  definer: string;
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
      renderDefineFile(definer, entity as Record<string, unknown>),
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
      'defineApplication',
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
        'defineApplicationRole',
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
    definer: 'defineRole',
    getFileName: (role) => slugify(role.label),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'objects',
    entities: manifest.objects,
    definer: 'defineObject',
    getFileName: (object) => kebabCase(object.nameSingular),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'permission-flags',
    entities: manifest.permissionFlags,
    definer: 'definePermissionFlag',
    getFileName: (permissionFlag) => slugify(permissionFlag.key),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'fields',
    entities: manifest.fields,
    definer: 'defineField',
    getFileName: (field) =>
      `${slugify(field.name)}-${field.universalIdentifier.slice(0, 8)}`,
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'views',
    entities: manifest.views,
    definer: 'defineView',
    getFileName: (view) => slugify(view.name),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'page-layouts',
    entities: manifest.pageLayouts,
    definer: 'definePageLayout',
    getFileName: (pageLayout) => slugify(pageLayout.name),
    writtenFiles,
  });

  await writeEntityFiles({
    srcDir,
    folder: 'navigation-menu-items',
    entities: manifest.navigationMenuItems,
    definer: 'defineNavigationMenuItem',
    getFileName: (navigationMenuItem) =>
      isDefined(navigationMenuItem.name)
        ? slugify(navigationMenuItem.name)
        : `navigation-menu-item-${navigationMenuItem.universalIdentifier.slice(0, 8)}`,
    writtenFiles,
  });

  return writtenFiles;
};
