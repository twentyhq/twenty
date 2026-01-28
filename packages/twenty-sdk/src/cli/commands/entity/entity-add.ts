import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { getFrontComponentBaseFile } from '@/cli/utilities/entity/entity-front-component-template';
import { getFunctionBaseFile } from '@/cli/utilities/entity/entity-function-template';
import { convertToLabel } from '@/cli/utilities/entity/entity-label';
import { getObjectBaseFile } from '@/cli/utilities/entity/entity-object-template';
import { getRoleBaseFile } from '@/cli/utilities/entity/entity-role-template';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import camelcase from 'lodash.camelcase';
import kebabcase from 'lodash.kebabcase';
import { join } from 'path';

const APP_FOLDER = 'src';

export enum SyncableEntity {
  AGENT = 'agent',
  OBJECT = 'object',
  FUNCTION = 'function',
  FRONT_COMPONENT = 'front-component',
  ROLE = 'role',
}

export const isSyncableEntity = (value: string): value is SyncableEntity => {
  return Object.values(SyncableEntity).includes(value as SyncableEntity);
};

export class EntityAddCommand {
  async execute(entityType?: SyncableEntity, path?: string): Promise<void> {
    try {
      // Default to src/ folder, allow override with path parameter
      const appPath = path
        ? join(CURRENT_EXECUTION_DIRECTORY, path)
        : join(CURRENT_EXECUTION_DIRECTORY, APP_FOLDER);

      await fs.ensureDir(appPath);

      const entity = entityType ?? (await this.getEntity());

      if (entity === SyncableEntity.OBJECT) {
        const entityData = await this.getObjectData();

        const name = entityData.nameSingular;

        // Use *.object.ts naming convention
        const objectFileName = `${camelcase(name)}.object.ts`;

        const decoratedObject = getObjectBaseFile({
          data: entityData,
          name,
        });

        const filePath = join(appPath, objectFileName);

        await fs.writeFile(filePath, decoratedObject);

        console.log(
          chalk.green(`✓ Created object:`),
          chalk.cyan(filePath.replace(CURRENT_EXECUTION_DIRECTORY + '/', '')),
        );

        return;
      }

      if (entity === SyncableEntity.FUNCTION) {
        const entityName = await this.getEntityName(entity);

        // Use *.function.ts naming convention
        const functionFileName = `${kebabcase(entityName)}.function.ts`;

        const decoratedLogicFunction = getFunctionBaseFile({
          name: entityName,
        });

        const filePath = join(appPath, functionFileName);

        await fs.writeFile(filePath, decoratedLogicFunction);

        console.log(
          chalk.green(`✓ Created function:`),
          chalk.cyan(filePath.replace(CURRENT_EXECUTION_DIRECTORY + '/', '')),
        );

        return;
      }

      if (entity === SyncableEntity.FRONT_COMPONENT) {
        const entityName = await this.getEntityName(entity);

        // Use *.front-component.tsx naming convention
        const frontComponentFileName = `${kebabcase(entityName)}.front-component.tsx`;

        const decoratedFrontComponent = getFrontComponentBaseFile({
          name: entityName,
        });

        const filePath = join(appPath, frontComponentFileName);

        await fs.writeFile(filePath, decoratedFrontComponent);

        console.log(
          chalk.green(`✓ Created front component:`),
          chalk.cyan(filePath.replace(CURRENT_EXECUTION_DIRECTORY + '/', '')),
        );

        return;
      }

      if (entity === SyncableEntity.ROLE) {
        const entityName = await this.getEntityName(entity);

        // Use *.role.ts naming convention
        const roleFileName = `${kebabcase(entityName)}.role.ts`;

        const roleFileContent = getRoleBaseFile({
          name: entityName,
        });

        const filePath = join(appPath, roleFileName);

        await fs.writeFile(filePath, roleFileContent);

        console.log(
          chalk.green(`✓ Created role:`),
          chalk.cyan(filePath.replace(CURRENT_EXECUTION_DIRECTORY + '/', '')),
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
        choices: [
          SyncableEntity.FUNCTION,
          SyncableEntity.FRONT_COMPONENT,
          SyncableEntity.OBJECT,
          SyncableEntity.ROLE,
        ],
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
