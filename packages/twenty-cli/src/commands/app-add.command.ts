import chalk from 'chalk';
import { resolveAppPath } from '../utils/app-path-resolver';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import { v4 } from 'uuid';
import path from 'path';
import { getSchemaUrls } from '../utils/schema-validator';
import { writeJsoncFile } from '../utils/jsonc-parser';

type SyncableEntity = 'agent' | 'object';

const getFolderName = (entity: SyncableEntity) => {
  switch (entity) {
    case 'agent':
      return 'agents';
    case 'object':
      return 'objects';
    default:
      throw new Error(`Unknown entity type: ${entity}`);
  }
};

export class AppAddCommand {
  async execute(options: {
    entity: 'agent' | 'object';
    path?: string;
  }): Promise<void> {
    try {
      const appPath = await resolveAppPath(options.path);

      const appExists = await fs.pathExists(appPath);

      if (!appExists) {
        console.error(chalk.red('App does not exists'));
        process.exit(1);
      }

      const entityName = await this.getEntityName(options.entity);

      const entityData = await this.getEntityToCreateData(
        options.entity,
        entityName,
      );

      const folderName = getFolderName(options.entity);

      const entitiesDir = path.join(appPath, folderName);

      await fs.ensureDir(entitiesDir);

      const entityPath = path.join(entitiesDir, `${entityName}.jsonc`);

      await writeJsoncFile(entityPath, entityData);
    } catch (error) {
      console.error(
        chalk.red(`Add new ${options.entity} failed:`),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getEntityName(entity: SyncableEntity) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Enter a name for your new ${entity}:`,
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

    return name;
  }

  private async getEntityToCreateData(
    entity: SyncableEntity,
    entityName: string,
  ) {
    const schemas = getSchemaUrls();

    const entityToCreateData: Record<string, string> = {
      $schema: schemas[entity],
      standardId: v4(),
    };

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
}
