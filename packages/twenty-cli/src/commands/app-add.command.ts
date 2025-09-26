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
  async execute(options: { path?: string }): Promise<void> {
    const entity = await this.getEntity();

    try {
      const appPath = await resolveAppPath(options.path);

      const appExists = await fs.pathExists(appPath);

      if (!appExists) {
        console.error(chalk.red('App does not exist'));
        process.exit(1);
      }

      const entityName = await this.getEntityName(entity);

      const entityData = await this.getEntityToCreateData(entity, entityName);

      const folderName = getFolderName(entity);

      const entitiesDir = path.join(appPath, folderName);

      await fs.ensureDir(entitiesDir);

      const entityPath = path.join(entitiesDir, `${entityName}.jsonc`);

      await writeJsoncFile(entityPath, entityData);
    } catch (error) {
      console.error(
        chalk.red(`Add new ${entity} failed:`),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getEntity() {
    const { entity } = await inquirer.prompt([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: ['agent', 'object'],
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
