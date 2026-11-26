import { globSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { getMetadataArgsStorage } from 'typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

const SERVER_ROOT = join(__dirname, '..', '..', '..', '..', '..');
const UPGRADE_COMMANDS_DIRECTORY = join(__dirname, '..');

const TABLE_RENAME_PATTERN =
  /ALTER TABLE\s+"?core"?\."(\w+)"\s+RENAME\s+TO\s+"(\w+)"/gi;
const COLUMN_RENAME_PATTERN =
  /ALTER TABLE\s+"?core"?\."(\w+)"\s+RENAME\s+COLUMN\s+"(\w+)"\s+TO\s+"(\w+)"/gi;

type CoreEntity = {
  entityClass: Function;
  tableNames: string[];
  columns: { propertyName: string; columnNames: string[] }[];
};

const listInstanceCommandFiles = () =>
  readdirSync(UPGRADE_COMMANDS_DIRECTORY, {
    recursive: true,
    encoding: 'utf8',
  })
    .filter(
      (path) =>
        path.includes('-instance-command-') &&
        path.endsWith('.ts') &&
        !path.endsWith('.spec.ts'),
    )
    .map((path) => join(UPGRADE_COMMANDS_DIRECTORY, path));

const loadCoreEntities = (): CoreEntity[] => {
  const { entities } = typeORMCoreModuleOptions;

  if (!Array.isArray(entities)) {
    throw new Error('Expected the core datasource entities to be a list');
  }

  const entityFiles = globSync(entities.filter(isString), {
    cwd: SERVER_ROOT,
  });

  if (entityFiles.length === 0) {
    throw new Error('No core entity file matched the datasource globs');
  }

  for (const entityFile of entityFiles) {
    require(join(SERVER_ROOT, entityFile));
  }

  const metadataArgsStorage = getMetadataArgsStorage();

  return metadataArgsStorage.tables.flatMap(
    ({ target: entityClass, name: tableName, schema }) => {
      if (
        schema !== 'core' ||
        typeof entityClass !== 'function' ||
        !isString(tableName)
      ) {
        return [];
      }

      const propertyRenameHistory =
        getWasRenamedInUpgradePropertyMetadata(entityClass);

      return [
        {
          entityClass,
          tableNames: [
            tableName,
            ...(getWasRenamedInUpgradeClassMetadata(entityClass) ?? []).map(
              ({ previousName }) => previousName,
            ),
          ],
          columns: metadataArgsStorage
            .filterColumns(entityClass)
            .map(({ propertyName, options }) => ({
              propertyName,
              columnNames: [
                options.name ?? propertyName,
                ...(propertyRenameHistory[propertyName] ?? []).map(
                  ({ previousName }) => previousName,
                ),
              ],
            })),
        },
      ];
    },
  );
};

const extractUpMethodSource = (source: string) => {
  const upIndex = source.search(/\basync up\(/);
  const downIndex = source.search(/\basync down\(/);

  if (upIndex === -1) {
    return '';
  }

  return downIndex > upIndex
    ? source.slice(upIndex, downIndex)
    : source.slice(upIndex);
};

const extractStepName = (source: string) => {
  const registration = source.match(
    /@RegisteredInstanceCommand\(\s*'([^']+)',\s*(\d+)/,
  );
  const className = source.match(/export class (\w+)/);

  if (!isDefined(registration) || !isDefined(className)) {
    return undefined;
  }

  return `${registration[1]}_${className[1]}_${registration[2]}`;
};

describe('instance command renames', () => {
  it('are declared with @WasRenamedInUpgrade on the matching core entity', () => {
    const coreEntities = loadCoreEntities();
    const problems: string[] = [];

    for (const commandFile of listInstanceCommandFiles()) {
      const source = readFileSync(commandFile, 'utf8');
      const stepName = extractStepName(source);
      const upMethodSource = extractUpMethodSource(source);

      for (const [, previousTableName, nextTableName] of upMethodSource.matchAll(
        TABLE_RENAME_PATTERN,
      )) {
        for (const { entityClass, tableNames } of coreEntities) {
          if (
            tableNames.includes(nextTableName) &&
            !tableNames.includes(previousTableName)
          ) {
            problems.push(
              `${stepName}: core."${previousTableName}" -> "${nextTableName}" is not declared on ${entityClass.name}`,
            );
          }
        }
      }

      for (const [
        ,
        tableName,
        previousColumnName,
        nextColumnName,
      ] of upMethodSource.matchAll(COLUMN_RENAME_PATTERN)) {
        for (const { entityClass, tableNames, columns } of coreEntities) {
          if (!tableNames.includes(tableName)) {
            continue;
          }

          for (const { propertyName, columnNames } of columns) {
            if (
              columnNames.includes(nextColumnName) &&
              !columnNames.includes(previousColumnName)
            ) {
              problems.push(
                `${stepName}: core."${tableName}"."${previousColumnName}" -> "${nextColumnName}" is not declared on ${entityClass.name}.${propertyName}`,
              );
            }
          }
        }
      }
    }

    expect(problems).toEqual([]);
  });
});
