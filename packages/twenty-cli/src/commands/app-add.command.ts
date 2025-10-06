import chalk from 'chalk';
import { randomUUID } from 'crypto';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { HTTPMethod } from '../types/config.types';
import { parseJsoncFile, writeJsoncFile } from '../utils/jsonc-parser';
import { getSchemaUrls } from '../utils/schema-validator';

export enum SyncableEntity {
  AGENT = 'agent',
  OBJECT = 'object',
  SERVERLESS_FUNCTION = 'serverlessFunction',
  TRIGGER = 'trigger',
}

const getFolderName = (entity: SyncableEntity) => {
  switch (entity) {
    case SyncableEntity.AGENT:
      return 'agents';
    case SyncableEntity.OBJECT:
      return 'objects';
    case SyncableEntity.SERVERLESS_FUNCTION:
      return 'serverlessFunctions';
    default:
      throw new Error(`Unknown entity type: ${entity}`);
  }
};

export const isSyncableEntity = (value: string): value is SyncableEntity => {
  return Object.values(SyncableEntity).includes(value as SyncableEntity);
};

export class AppAddCommand {
  async execute(entityType?: SyncableEntity): Promise<void> {
    try {
      const appPath = CURRENT_EXECUTION_DIRECTORY;

      const entity = entityType ?? (await this.getEntity());

      const appExists = await fs.pathExists(appPath);

      if (!appExists) {
        console.error(chalk.red('App does not exist'));
        process.exit(1);
      }

      if (entity === SyncableEntity.TRIGGER) {
        await this.addTriggerToServerlessFunction(appPath);
        return;
      }

      const entityName = await this.getEntityName(entity);

      const entityData = await this.getEntityToCreateData(entity, entityName);

      const folderName = getFolderName(entity);

      const entitiesDir = path.join(appPath, folderName, entityName);

      await fs.ensureDir(entitiesDir);

      await writeJsoncFile(
        path.join(entitiesDir, `${entity}.manifest.jsonc`),
        entityData,
      );

      await this.addEntityInitFiles(entity, entitiesDir);
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
        choices: [SyncableEntity.SERVERLESS_FUNCTION, SyncableEntity.TRIGGER],
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

    const schemasDir = path.join(__dirname, '../../schemas');

    const schemaPath = path.join(schemasDir, `${entity}.schema.json`);

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

  private async addTriggerToServerlessFunction(appPath: string) {
    const serverlessFunctionsDir = path.join(appPath, 'serverlessFunctions');

    if (!(await fs.pathExists(serverlessFunctionsDir))) {
      console.error(chalk.red('No serverless functions found in this app'));
      process.exit(1);
    }

    const serverlessFunctions = await fs.readdir(serverlessFunctionsDir);

    if (serverlessFunctions.length === 0) {
      console.error(chalk.red('No serverless functions found in this app'));
      process.exit(1);
    }

    const { serverlessFunctionName } = await inquirer.prompt<{
      serverlessFunctionName: string;
    }>([
      {
        type: 'list',
        name: 'serverlessFunctionName',
        message: 'Select a serverless function to add a trigger to:',
        choices: serverlessFunctions,
      },
    ]);

    const { triggerType } = await inquirer.prompt<{ triggerType: string }>([
      {
        type: 'list',
        name: 'triggerType',
        message: 'Select the type of trigger:',
        choices: ['databaseEvent', 'cron', 'route'],
      },
    ]);

    let triggerData: any;

    if (triggerType === 'databaseEvent') {
      triggerData = await this.createDatabaseEventTrigger();
    } else if (triggerType === 'cron') {
      triggerData = await this.createCronTrigger();
    } else if (triggerType === 'route') {
      triggerData = await this.createRouteTrigger();
    }

    const manifestPath = path.join(
      serverlessFunctionsDir,
      serverlessFunctionName,
      'serverlessFunction.manifest.jsonc',
    );

    const manifest = await parseJsoncFile(manifestPath);

    if (!manifest.triggers) {
      manifest.triggers = [];
    }

    manifest.triggers.push(triggerData);

    await writeJsoncFile(manifestPath, manifest);

    console.log(
      chalk.green(`✅ Trigger added successfully to ${serverlessFunctionName}`),
    );
  }

  private async createDatabaseEventTrigger() {
    const uuid = randomUUID();

    const { eventName } = await inquirer.prompt<{ eventName: string }>([
      {
        type: 'input',
        name: 'eventName',
        message:
          'Enter the database event name (e.g. company.created, *.updated, person.*):',
        validate: (input) => {
          if (input.length === 0) {
            return 'Event name is required';
          }
          if (!/^(?:[a-zA-Z]+|\*)\.(created|updated|deleted|\*)$/.test(input)) {
            return 'Event name must be in format: (objectName|*).(created|updated|deleted|*)';
          }
          return true;
        },
      },
    ]);

    return {
      universalIdentifier: uuid,
      type: 'databaseEvent',
      eventName,
    };
  }

  private async createCronTrigger() {
    const uuid = randomUUID();

    const { schedule } = await inquirer.prompt<{ schedule: string }>([
      {
        type: 'input',
        name: 'schedule',
        message: 'Enter the cron schedule (e.g., 0 9 * * * for daily at 9 AM):',
        validate: (input) => {
          if (input.length === 0) {
            return 'Schedule is required';
          }

          const parts = input.trim().split(/\s+/);

          if (parts.length < 5 || parts.length > 6) {
            return 'Cron schedule must have 5 or 6 fields (e.g., 0 9 * * *)';
          }
          return true;
        },
      },
    ]);

    return {
      universalIdentifier: uuid,
      type: 'cron',
      schedule,
    };
  }

  private async createRouteTrigger() {
    const uuid = randomUUID();

    const { path } = await inquirer.prompt<{ path: string }>([
      {
        type: 'input',
        name: 'path',
        message: 'Enter the route path (e.g., /webhook/company):',
        validate: (input) => {
          if (input.length === 0) {
            return 'Path is required';
          }
          if (!input.startsWith('/')) {
            return 'Path must start with /';
          }
          return true;
        },
      },
    ]);

    const { httpMethod } = await inquirer.prompt<{ httpMethod: HTTPMethod }>([
      {
        type: 'list',
        name: 'httpMethod',
        message: 'Select the HTTP method:',
        choices: Object.values(HTTPMethod),
        default: HTTPMethod.GET,
      },
    ]);

    const { isAuthRequired } = await inquirer.prompt<{
      isAuthRequired: boolean;
    }>([
      {
        type: 'confirm',
        name: 'isAuthRequired',
        message: 'Is authentication required?',
        default: true,
      },
    ]);

    return {
      universalIdentifier: uuid,
      type: 'route',
      path,
      httpMethod,
      isAuthRequired,
    };
  }
}
