import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { v4 } from 'uuid';
import { resolveAppPath } from '../utils/app-path-resolver';
import { parseJsoncFile, writeJsoncFile } from '../utils/jsonc-parser';
import { getSchemaUrls } from '../utils/schema-validator';

enum SyncableEntity {
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

export class AppAddCommand {
  async execute(options: { path?: string }): Promise<void> {
    try {
      const appPath = await resolveAppPath(options.path);

      const entity = await this.getEntity();

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
    const { entity } = await inquirer.prompt([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: [
          SyncableEntity.AGENT,
          SyncableEntity.OBJECT,
          SyncableEntity.SERVERLESS_FUNCTION,
          SyncableEntity.TRIGGER,
        ],
      },
    ]);

    return entity as SyncableEntity;
  }

  private async getEntityName(entity: SyncableEntity) {
    const { name } = await inquirer.prompt([
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

    return name as string;
  }

  private async getEntityToCreateData(
    entity: SyncableEntity,
    entityName: string,
  ) {
    const schemas = getSchemaUrls();

    const uuid = v4();

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

      const answer = await inquirer.prompt([
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

    const { serverlessFunctionName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'serverlessFunctionName',
        message: 'Select a serverless function to add a trigger to:',
        choices: serverlessFunctions,
      },
    ]);

    const { triggerType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'triggerType',
        message: 'Select the type of trigger:',
        choices: ['databaseEvent', 'cron'],
      },
    ]);

    let triggerData: any;

    if (triggerType === 'databaseEvent') {
      triggerData = await this.createDatabaseEventTrigger();
    } else if (triggerType === 'cron') {
      triggerData = await this.createCronTrigger();
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
    const uuid = v4();

    const { eventName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'eventName',
        message: 'Enter the database event name (e.g., company.created):',
        validate: (input) => {
          if (input.length === 0) {
            return 'Event name is required';
          }
          if (!/^[a-zA-Z]+\.(created|updated|deleted)$/.test(input)) {
            return 'Event name must be in format: objectName.(created|updated|deleted)';
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
    const uuid = v4();

    const { schedule } = await inquirer.prompt([
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
}
