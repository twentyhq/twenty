import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { getFrontComponentBaseFile } from '@/cli/utilities/entity/entity-front-component-template';
import { getLogicFunctionBaseFile } from '@/cli/utilities/entity/entity-logic-function-template';
import { convertToLabel } from '@/cli/utilities/entity/entity-label';
import { getObjectBaseFile } from '@/cli/utilities/entity/entity-object-template';
import { getRoleBaseFile } from '@/cli/utilities/entity/entity-role-template';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import kebabcase from 'lodash.kebabcase';
import { join, relative } from 'path';
import { SyncableEntity } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { getFieldBaseFile } from '@/cli/utilities/entity/entity-field-template';

const APP_FOLDER = 'src';

export class EntityAddCommand {
  async execute(entityType?: SyncableEntity, path?: string): Promise<void> {
    try {
      const entity = entityType ?? (await this.getEntity());

      const entityName = this.getFolderName(entity);

      const appPath = path
        ? join(CURRENT_EXECUTION_DIRECTORY, path)
        : join(CURRENT_EXECUTION_DIRECTORY, APP_FOLDER, entityName);

      await fs.ensureDir(appPath);

      const { name, file } = await this.getEntityData(entity);

      const filePath = join(appPath, this.getFileName(name, entity));

      if (await fs.pathExists(filePath)) {
        const { overwrite } = await this.handleFileExist();
        if (!overwrite) {
          return;
        }
      }

      await fs.writeFile(filePath, file);

      console.log(
        chalk.green(`✓ Created ${entityName}:`),
        chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, filePath)),
      );
    } catch (error) {
      console.error(
        chalk.red(`Add new entity failed:`),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getEntityData(entity: SyncableEntity) {
    switch (entity) {
      case SyncableEntity.Object: {
        const entityData = await this.getObjectData();

        const name = entityData.nameSingular;

        const file = getObjectBaseFile({
          data: entityData,
          name,
        });

        return { name, file };
      }

      case SyncableEntity.Field: {
        const entityData = await this.getFieldData();

        const name = entityData.name;

        const file = getFieldBaseFile({
          data: entityData,
          name,
        });

        return { name, file };
      }

      case SyncableEntity.LogicFunction: {
        const name = await this.getEntityName(entity);

        const file = getLogicFunctionBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.FrontComponent: {
        const name = await this.getEntityName(entity);

        const file = getFrontComponentBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.Role: {
        const name = await this.getEntityName(entity);

        const file = getRoleBaseFile({
          name,
        });

        return { name, file };
      }

      default:
        assertUnreachable(entity);
    }
  }

  private async getEntity() {
    const { entity } = await inquirer.prompt<{ entity: SyncableEntity }>([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: Object.values(SyncableEntity),
      },
    ]);

    return entity;
  }

  private async handleFileExist() {
    return await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `File already exists. Do you want to overwrite it?`,
        default: false,
      },
    ]);
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

          return true;
        },
      },
    ]);

    return name;
  }

  private async getFieldData() {
    return inquirer.prompt<{
      name: string;
      label: string;
      type: FieldMetadataType;
      objectUniversalIdentifier: string;
      description: string;
    }>([
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for your field:',
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
        name: 'label',
        message: 'Enter a label for your field:',
        default: (answers: any) => {
          return convertToLabel(answers.name);
        },
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'select',
        name: 'type',
        message: 'Select the field type:',
        choices: Object.values(FieldMetadataType),
        default: FieldMetadataType.TEXT,
      },
      {
        type: 'input',
        name: 'objectUniversalIdentifier',
        message:
          'Enter the universalIdentifier of the object this field belongs to:',
        default: 'fill-later',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter a description for your field (optional):',
        default: '',
      },
    ]);
  }

  private async getObjectData() {
    return inquirer.prompt<{
      nameSingular: string;
      namePlural: string;
      labelSingular: string;
      labelPlural: string;
    }>([
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

  getFolderName(entity: SyncableEntity) {
    return `${kebabcase(entity)}s`;
  }

  getFileName(name: string, entity: SyncableEntity) {
    switch (entity) {
      case SyncableEntity.FrontComponent: {
        return `${kebabcase(name)}.tsx`;
      }
      default: {
        return `${kebabcase(name)}.ts`;
      }
    }
  }
}
