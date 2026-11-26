import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { getMetadataArgsStorage } from 'typeorm';

import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

const SOURCE_ROOT = join(__dirname, '..', '..', '..', '..');
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

const listFiles = (directory: string, suffix: string) =>
  readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith(suffix))
    .map((path) => join(directory, path));

const loadCoreEntities = (): CoreEntity[] => {
  for (const modulesDirectory of ['core-modules', 'metadata-modules']) {
    for (const entityFile of listFiles(
      join(SOURCE_ROOT, 'engine', modulesDirectory),
      '.entity.ts',
    )) {
      require(entityFile);
    }
  }

  const metadataArgsStorage = getMetadataArgsStorage();

  return metadataArgsStorage.tables
    .filter(
      (table) =>
        table.schema === 'core' &&
        typeof table.target === 'function' &&
        typeof table.name === 'string',
    )
    .map((table) => {
      const entityClass = table.target as Function;
      const propertyRenameHistory =
        getWasRenamedInUpgradePropertyMetadata(entityClass);

      return {
        entityClass,
        tableNames: [
          table.name as string,
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
      };
    });
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

  if (registration === null || className === null) {
    return undefined;
  }

  return `${registration[1]}_${className[1]}_${registration[2]}`;
};

describe('instance command renames', () => {
  it('are declared with @WasRenamedInUpgrade on the matching core entity', () => {
    const coreEntities = loadCoreEntities();
    const problems: string[] = [];

    const instanceCommandFiles = listFiles(
      UPGRADE_COMMANDS_DIRECTORY,
      '.ts',
    ).filter(
      (path) => path.includes('-instance-command-') && !path.endsWith('.spec.ts'),
    );

    for (const commandFile of instanceCommandFiles) {
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
