import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import { join } from 'path';
import camelcase from 'lodash.camelcase';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { getObjectDecoratedClass } from '@/cli/utils/get-object-decorated-class';
import { getFunctionBaseFile } from '@/cli/utils/get-function-base-file';
import { convertToLabel } from '@/cli/utils/convert-to-label';

export enum SyncableEntity {
  AGENT = 'agent',
  OBJECT = 'object',
  FUNCTION = 'function',
}

export const isSyncableEntity = (value: string): value is SyncableEntity => {
  return Object.values(SyncableEntity).includes(value as SyncableEntity);
};

export class AppAddCommand {
  async execute(entityType?: SyncableEntity, path?: string): Promise<void> {
    try {
      const appPath = join(CURRENT_EXECUTION_DIRECTORY, path ?? '');

      await fs.ensureDir(appPath);

      const entity = entityType ?? (await this.getEntity());

      if (entity === SyncableEntity.OBJECT) {
        const entityData = await this.getObjectData();

        const name = entityData.nameSingular;

        const objectFileName = `${camelcase(name)}.ts`;

        const decoratedObject = getObjectDecoratedClass({
          data: entityData,
          name,
        });

        await fs.writeFile(join(appPath, objectFileName), decoratedObject);

        return;
      }

      if (entity === SyncableEntity.FUNCTION) {
        const entityName = await this.getEntityName(entity);

        const objectFileName = `${camelcase(entityName)}.ts`;

        const decoratedServerlessFunction = getFunctionBaseFile({
          name: entityName,
        });

        await fs.writeFile(
          join(appPath, objectFileName),
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

  private async getEntity() {
    const { entity } = await inquirer.prompt<{ entity: SyncableEntity }>([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: [SyncableEntity.FUNCTION, SyncableEntity.OBJECT],
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

  private async getObjectData() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'nameSingular',
        message: 'Enter a name singular for your object (eg: company):',
        default: '',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'namePlural',
        message: 'Enter a name plural for your object (eg: companies):',
        default: '',
        validate: (input: string, answers?: any) => {
          if (input.trim() === answers?.nameSingular.trim()) {
            return 'Name plural must be different from name singular';
          }
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'labelSingular',
        message: 'Enter a label singular for your object:',
        default: (answers: any) => {
          return convertToLabel(answers.nameSingular);
        },
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'labelPlural',
        message: 'Enter a label plural for your object:',
        default: (answers: any) => {
          return convertToLabel(answers.namePlural);
        },
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
    ]);
  }
}
