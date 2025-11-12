import chalk from 'chalk';
import { randomUUID } from 'crypto';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import camelcase from 'lodash.camelcase';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { getSchemaUrls } from '../utils/schema-validator';
import { BASE_SCHEMAS_PATH } from '../constants/constants-path';
import { getObjectMetadataDecoratedClass } from '../utils/get-object-metadata-decorated-class';
import { getServerlessFunctionBaseFile } from '../utils/get-serverless-function-base-file';

const ROOT_FOLDER = 'src';

export enum SyncableEntity {
  AGENT = 'agent',
  OBJECT = 'object',
  SERVERLESS_FUNCTION = 'serverlessFunction',
}

export const isSyncableEntity = (value: string): value is SyncableEntity => {
  return Object.values(SyncableEntity).includes(value as SyncableEntity);
};

export class AppAddCommand {
  async execute(entityType?: SyncableEntity): Promise<void> {
    try {
      const appPath = path.join(CURRENT_EXECUTION_DIRECTORY, ROOT_FOLDER);

      await fs.ensureDir(appPath);

      const entity = entityType ?? (await this.getEntity());

      const entityName = await this.getEntityName(entity);

      const entityData = await this.getEntityToCreateData(entity, entityName);

      if (entity === SyncableEntity.OBJECT) {
        delete entityData['standardId'];
        delete entityData['$schema'];

        const objectFileName = `${camelcase(entityName)}.ts`;

        const decoratedObject = getObjectMetadataDecoratedClass({
          data: entityData,
          name: entityName,
        });

        await fs.writeFile(path.join(appPath, objectFileName), decoratedObject);

        return;
      }

      if (entity === SyncableEntity.SERVERLESS_FUNCTION) {
        const objectFileName = `${camelcase(entityName)}.ts`;

        const decoratedServerlessFunction = getServerlessFunctionBaseFile({
          name: entityName,
        });

        await fs.writeFile(
          path.join(appPath, objectFileName),
          decoratedServerlessFunction,
        );

        return;
      }
    } catch (error) {
      console.error(
        chalk.red(`Add new entity failed:`),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async addEntityInitFiles(entity: SyncableEntity, entityPath: string) {
    switch (entity) {
      case SyncableEntity.SERVERLESS_FUNCTION: {
        const srcPath = path.join(entityPath, 'src');
        await fs.ensureDir(srcPath);

        await fs.writeFile(
          path.join(srcPath, 'index.ts'),
          'export const main = async (params: {\n  a: string;\n  b: number;\n}): Promise<object> => {\n  const { a, b } = params;\n\n  // Rename the parameters and code below with your own logic\n  // This is just an example\n  const message = `Hello, input: ${a} and ${b}`;\n\n\n\n  return { message };\n};',
        );

        return;
      }
      case SyncableEntity.AGENT:
      case SyncableEntity.OBJECT:
        return;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  private async getEntity() {
    const { entity } = await inquirer.prompt<{ entity: SyncableEntity }>([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: [SyncableEntity.SERVERLESS_FUNCTION, SyncableEntity.OBJECT],
      },
    ]);

    return entity;
  }

  private async getEntityName(entity: SyncableEntity) {
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: `Enter a name for your new ${entity}:`,
        default: '',
        validate: (input) => {
          if (input.length === 0) {
            return `${entity} name is required`;
          }

          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Name must contain only lowercase letters, numbers, and hyphens';
          }

          return true;
        },
      },
    ]);

    return name;
  }

  private async getEntityToCreateData(
    entity: SyncableEntity,
    entityName: string,
  ) {
    const schemas = getSchemaUrls();

    const uuid = randomUUID();

    const entityToCreateData: Record<string, string> = {
      $schema: schemas[entity],
      universalIdentifier: uuid,
    };

    if (entity === SyncableEntity.OBJECT || entity === SyncableEntity.AGENT) {
      entityToCreateData.standardId = uuid;
    }

    const schemaPath = path.join(BASE_SCHEMAS_PATH, `${entity}.schema.json`);

    const schema = await fs.readJson(schemaPath);

    const requiredFields = schema.required;

    for (const requiredField of requiredFields) {
      if (requiredField === 'name') {
        entityToCreateData.name = entityName;
        continue;
      }

      if (Object.keys(entityToCreateData).includes(requiredField)) {
        continue;
      }

      const answer = await inquirer.prompt<{ [key: string]: string }>([
        {
          type: 'input',
          name: requiredField,
          message: `Enter a ${requiredField} for your new ${entity}:`,
          default: '',
          validate: (input) => {
            try {
              return input.length > 0;
            } catch {
              return 'Please enter non empty string';
            }
          },
        },
      ]);

      entityToCreateData[requiredField] = answer[requiredField];
    }

    return entityToCreateData;
  }
}
