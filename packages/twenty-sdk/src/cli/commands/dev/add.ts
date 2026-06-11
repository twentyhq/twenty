import chalk from 'chalk';
import inquirer from 'inquirer';
import { writeFile } from 'node:fs/promises';
import { join, relative } from 'path';
import { SyncableEntity } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
  ViewType,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { convertToLabel } from '@/cli/utilities/entity/entity-label';
import { appendServerVariablesToAppConfig } from '@/cli/utilities/file/append-server-variables.util';
import { getFieldBaseFile } from '@/cli/utilities/entity/entity-field-template';
import { getFrontComponentBaseFile } from '@/cli/utilities/entity/entity-front-component-template';
import { getLogicFunctionBaseFile } from '@/cli/utilities/entity/entity-logic-function-template';
import { getNavigationMenuItemBaseFile } from '@/cli/utilities/entity/entity-navigation-menu-item-template';
import { getObjectBaseFile } from '@/cli/utilities/entity/entity-object-template';
import { getCommandMenuItemBaseFile } from '@/cli/utilities/entity/entity-command-menu-item-template';
import { getPageLayoutBaseFile } from '@/cli/utilities/entity/entity-page-layout-template';
import { getPageLayoutTabBaseFile } from '@/cli/utilities/entity/entity-page-layout-tab-template';
import { getRecordPageLayoutBaseFile } from '@/cli/utilities/entity/entity-record-page-layout-template';
import { getRoleBaseFile } from '@/cli/utilities/entity/entity-role-template';
import { getAgentBaseFile } from '@/cli/utilities/entity/entity-agent-template';
import { getConnectionProviderBaseFile } from '@/cli/utilities/entity/entity-connection-provider-template';
import { getSkillBaseFile } from '@/cli/utilities/entity/entity-skill-template';
import { getViewBaseFile } from '@/cli/utilities/entity/entity-view-template';
import { getViewFieldBaseFile } from '@/cli/utilities/entity/entity-view-field-template';
import { ensureDir, pathExists } from '@/cli/utilities/file/fs-utils';
import { kebabCase } from '@/cli/utilities/string/kebab-case';

const APP_CONFIG_HINT_PATH = 'src/application.config.ts';

const APP_FOLDER = 'src';

export class EntityAddCommand {
  private lastObjectUniversalIdentifier: string | undefined;
  private lastNameFieldUniversalIdentifier: string | undefined;
  private lastObjectLabelSingular: string | undefined;

  async execute(entityType?: SyncableEntity | 'relation', path?: string): Promise<void> {
    try {
      const entity = entityType ?? (await this.getEntity());

      if (entity === 'relation') {
        await this.createRelation(path);
        return;
      }

      const entityName = this.getFolderName(entity);

      const appPath = path
        ? join(CURRENT_EXECUTION_DIRECTORY, path)
        : join(CURRENT_EXECUTION_DIRECTORY, APP_FOLDER, entityName);

      await ensureDir(appPath);

      const { name, file } = await this.getEntityData(entity);

      const filePath = join(appPath, this.getFileName(name, entity));

      if (await pathExists(filePath)) {
        const { overwrite } = await this.handleFileExist();
        if (!overwrite) {
          return;
        }
      }

      await writeFile(filePath, file);

      console.log(
        chalk.green(`✓ Created ${entityName}:`),
        chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, filePath)),
      );

      if (entity === SyncableEntity.Object) {
        await this.promptAndCreateObjectCompanions(name, path);
      }

      if (entity === SyncableEntity.ConnectionProvider) {
        await this.registerConnectionProviderServerVariables(name);
      }
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
        const objectUniversalIdentifier = v4();
        const nameFieldUniversalIdentifier = v4();

        this.lastObjectUniversalIdentifier = objectUniversalIdentifier;
        this.lastNameFieldUniversalIdentifier = nameFieldUniversalIdentifier;
        this.lastObjectLabelSingular = entityData.labelSingular;

        const file = getObjectBaseFile({
          data: entityData,
          name,
          universalIdentifier: objectUniversalIdentifier,
          nameFieldUniversalIdentifier,
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

      case SyncableEntity.Skill: {
        const name = await this.getEntityName(entity);

        const file = getSkillBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.Agent: {
        const name = await this.getEntityName(entity);

        const file = getAgentBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.ConnectionProvider: {
        const name = await this.getEntityName(entity);

        const file = getConnectionProviderBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.View: {
        const entityData = await this.getViewData();

        const name = entityData.name;

        const file = getViewBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.ViewField: {
        const name = await this.getEntityName(entity);

        const file = getViewFieldBaseFile({});

        return { name, file };
      }

      case SyncableEntity.NavigationMenuItem: {
        const name = await this.getEntityName(entity);

        const file = getNavigationMenuItemBaseFile({
          name,
        });

        return { name, file };
      }

      case SyncableEntity.PageLayout: {
        const name = await this.getEntityName(entity);

        const file = getPageLayoutBaseFile({
          name,
        });
        return { name, file };
      }

      case SyncableEntity.PageLayoutTab: {
        const name = await this.getEntityName(entity);

        const file = getPageLayoutTabBaseFile({
          name,
        });
        return { name, file };
      }

      case SyncableEntity.CommandMenuItem: {
        const name = await this.getEntityName(entity);

        const file = getCommandMenuItemBaseFile({
          name,
        });
        return { name, file };
      }

      default:
        assertUnreachable(entity);
    }
  }

  private async promptAndCreateObjectCompanions(
    objectName: string,
    customPath?: string,
  ): Promise<void> {
    const { createCompanions } = await inquirer.prompt<{
      createCompanions: boolean;
    }>([
      {
        type: 'confirm',
        name: 'createCompanions',
        message:
          'Also create a view, navigation menu item, and record page layout for this object? (recommended)',
        default: true,
      },
    ]);

    if (!createCompanions || !this.lastObjectUniversalIdentifier) {
      return;
    }

    const viewUniversalIdentifier = v4();
    const fieldsWidgetViewUniversalIdentifier = v4();

    const viewFile = getViewBaseFile({
      name: `all-${kebabCase(objectName)}`,
      universalIdentifier: viewUniversalIdentifier,
      objectUniversalIdentifier: this.lastObjectUniversalIdentifier,
      fields: this.lastNameFieldUniversalIdentifier
        ? [
            {
              fieldMetadataUniversalIdentifier:
                this.lastNameFieldUniversalIdentifier,
              position: 0,
              isVisible: true,
              size: 200,
            },
          ]
        : [],
    });

    const viewFolderPath = customPath
      ? join(CURRENT_EXECUTION_DIRECTORY, customPath)
      : join(
          CURRENT_EXECUTION_DIRECTORY,
          APP_FOLDER,
          this.getFolderName(SyncableEntity.View),
        );

    await ensureDir(viewFolderPath);

    const viewFileName = `all-${kebabCase(objectName)}.ts`;
    const viewFilePath = join(viewFolderPath, viewFileName);

    if (await pathExists(viewFilePath)) {
      const { overwrite } = await this.handleFileExist();

      if (!overwrite) {
        return;
      }
    }

    await writeFile(viewFilePath, viewFile);

    console.log(
      chalk.green(`✓ Created view:`),
      chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, viewFilePath)),
    );

    const recordPageFieldsViewFields = this.buildRecordPageFieldsViewFields(
      this.lastNameFieldUniversalIdentifier,
    );

    const recordPageFieldsViewFile = getViewBaseFile({
      name: `${kebabCase(objectName)}-record-page-fields`,
      universalIdentifier: fieldsWidgetViewUniversalIdentifier,
      objectUniversalIdentifier: this.lastObjectUniversalIdentifier,
      type: ViewType.FIELDS_WIDGET,
      fields: recordPageFieldsViewFields,
    });

    const recordPageFieldsViewFileName = `${kebabCase(objectName)}-record-page-fields.ts`;
    const recordPageFieldsViewFilePath = join(
      viewFolderPath,
      recordPageFieldsViewFileName,
    );

    if (await pathExists(recordPageFieldsViewFilePath)) {
      const { overwrite } = await this.handleFileExist();

      if (!overwrite) {
        return;
      }
    }

    await writeFile(recordPageFieldsViewFilePath, recordPageFieldsViewFile);

    console.log(
      chalk.green(`✓ Created record-page-fields view:`),
      chalk.cyan(
        relative(CURRENT_EXECUTION_DIRECTORY, recordPageFieldsViewFilePath),
      ),
    );

    const navFile = getNavigationMenuItemBaseFile({
      name: objectName,
      type: 'OBJECT',
      targetObjectUniversalIdentifier: this.lastObjectUniversalIdentifier,
    });

    const navFolderPath = customPath
      ? join(CURRENT_EXECUTION_DIRECTORY, customPath)
      : join(
          CURRENT_EXECUTION_DIRECTORY,
          APP_FOLDER,
          this.getFolderName(SyncableEntity.NavigationMenuItem),
        );

    await ensureDir(navFolderPath);

    const navFileName = `${kebabCase(objectName)}.ts`;
    const navFilePath = join(navFolderPath, navFileName);

    if (await pathExists(navFilePath)) {
      const { overwrite } = await this.handleFileExist();

      if (!overwrite) {
        return;
      }
    }

    await writeFile(navFilePath, navFile);

    console.log(
      chalk.green(`✓ Created navigation menu item:`),
      chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, navFilePath)),
    );

    const recordPageLayoutFile = getRecordPageLayoutBaseFile({
      objectLabelSingular: this.lastObjectLabelSingular ?? objectName,
      objectUniversalIdentifier: this.lastObjectUniversalIdentifier,
      fieldsWidgetViewUniversalIdentifier,
    });

    const pageLayoutFolderPath = customPath
      ? join(CURRENT_EXECUTION_DIRECTORY, customPath)
      : join(
          CURRENT_EXECUTION_DIRECTORY,
          APP_FOLDER,
          this.getFolderName(SyncableEntity.PageLayout),
        );

    await ensureDir(pageLayoutFolderPath);

    const recordPageLayoutFileName = `${kebabCase(objectName)}-record-page-layout.ts`;
    const recordPageLayoutFilePath = join(
      pageLayoutFolderPath,
      recordPageLayoutFileName,
    );

    if (await pathExists(recordPageLayoutFilePath)) {
      const { overwrite } = await this.handleFileExist();

      if (!overwrite) {
        return;
      }
    }

    await writeFile(recordPageLayoutFilePath, recordPageLayoutFile);

    console.log(
      chalk.green(`✓ Created record page layout:`),
      chalk.cyan(
        relative(CURRENT_EXECUTION_DIRECTORY, recordPageLayoutFilePath),
      ),
    );
  }

  // Connection providers reference two serverVariables (`<NAME>_CLIENT_ID`
  // and `<NAME>_CLIENT_SECRET`) that the dev needs to declare on
  // `defineApplication.serverVariables`. Auto-append them so the dev
  // doesn't have to remember the wiring after `twenty dev:add connection-provider`.
  // The util is best-effort: it handles the common file shapes and falls
  // back to a printed snippet for anything it can't safely modify.
  private async registerConnectionProviderServerVariables(
    name: string,
  ): Promise<void> {
    const upperKey = kebabCase(name).toUpperCase().replace(/-/g, '_');
    const variables = [
      {
        name: `${upperKey}_CLIENT_ID`,
        description:
          'OAuth client ID issued by the third-party provider. Filled in once by the server admin on the application registration.',
        isSecret: false,
      },
      {
        name: `${upperKey}_CLIENT_SECRET`,
        description:
          'OAuth client secret issued by the third-party provider. Stored encrypted; never echoed in API responses.',
        isSecret: true,
      },
    ];

    const result = await appendServerVariablesToAppConfig({
      projectRoot: CURRENT_EXECUTION_DIRECTORY,
      variables,
    });

    switch (result.status) {
      case 'appended':
      case 'created': {
        console.log(
          chalk.green(
            `✓ Added ${variables.map((v) => v.name).join(' + ')} to defineApplication.serverVariables:`,
          ),
          chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, result.file)),
        );
        break;
      }
      case 'skipped-existing':
        console.log(
          chalk.dim(
            `  (${variables.map((v) => v.name).join(' / ')} already declared on defineApplication.serverVariables)`,
          ),
        );
        break;
      case 'skipped-no-config':
      case 'skipped-no-app-call':
        console.log(
          chalk.yellow(
            `! Couldn't auto-update ${APP_CONFIG_HINT_PATH}. Add these manually to defineApplication.serverVariables:\n` +
              variables
                .map(
                  (v) =>
                    `    ${v.name}: { description: '...', isSecret: ${v.isSecret}, isRequired: true },`,
                )
                .join('\n'),
          ),
        );
        break;
    }
  }

  private buildRecordPageFieldsViewFields(
    nameFieldUniversalIdentifier: string | undefined,
  ) {
    const autoGeneratedFieldNames = [
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
    ] as const;

    const autoGeneratedFields = autoGeneratedFieldNames.map((fieldName) => ({
      defaultFieldName: fieldName,
      isVisible: true,
      size: 200,
    }));

    const fields = nameFieldUniversalIdentifier
      ? [
          {
            fieldMetadataUniversalIdentifier: nameFieldUniversalIdentifier,
            isVisible: true,
            size: 200,
          },
          ...autoGeneratedFields,
        ]
      : autoGeneratedFields;

    return fields.map((field, index) => ({ ...field, position: index }));
  }

  private async getEntity() {
    const { entity } = await inquirer.prompt<{ entity: SyncableEntity | 'relation' }>([
      {
        type: 'select',
        name: 'entity',
        message: `What entity do you want to create?`,
        default: '',
        choices: [...Object.values(SyncableEntity), 'relation'],
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
    const isRelationFieldType = (type: FieldMetadataType | undefined) =>
      type === FieldMetadataType.RELATION ||
      type === FieldMetadataType.MORPH_RELATION;

    return inquirer.prompt<{
      name: string;
      label: string;
      type: FieldMetadataType;
      objectUniversalIdentifier: string;
      description: string;
      relationTargetObjectMetadataUniversalIdentifier?: string;
      relationTargetFieldMetadataUniversalIdentifier?: string;
      relationType?: RelationType;
      onDelete?: RelationOnDeleteAction;
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
      {
        type: 'input',
        name: 'relationTargetObjectMetadataUniversalIdentifier',
        message:
          'Enter the universalIdentifier of the target object of the relation:',
        default: 'fill-later',
        when: (answers) => isRelationFieldType(answers.type),
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'relationTargetFieldMetadataUniversalIdentifier',
        message:
          'Enter the universalIdentifier of the target field on the related object:',
        default: 'fill-later',
        when: (answers) => isRelationFieldType(answers.type),
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non empty string';
          }
          return true;
        },
      },
      {
        type: 'select',
        name: 'relationType',
        message: 'Select the relation type:',
        choices: Object.values(RelationType),
        default: RelationType.ONE_TO_MANY,
        when: (answers) => isRelationFieldType(answers.type),
      },
      {
        type: 'select',
        name: 'onDelete',
        message: 'Select the onDelete behavior:',
        choices: Object.values(RelationOnDeleteAction),
        default: RelationOnDeleteAction.CASCADE,
        when: (answers) => isRelationFieldType(answers.type),
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

  private async getViewData() {
    return inquirer.prompt<{
      name: string;
      objectUniversalIdentifier: string;
    }>([
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for your view:',
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
        name: 'objectUniversalIdentifier',
        message:
          'Enter the universalIdentifier of the object this view belongs to:',
        default: 'fill-later',
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
    return `${kebabCase(entity)}s`;
  }

  getFileName(name: string, entity: SyncableEntity) {
    switch (entity) {
      case SyncableEntity.FrontComponent: {
        return `${kebabCase(name)}.tsx`;
      }
      default: {
        return `${kebabCase(name)}.ts`;
      }
    }
  }

  private async createRelation(customPath?: string): Promise<void> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const manifestResult = await buildManifest(CURRENT_EXECUTION_DIRECTORY);
    const appObjects = (manifestResult.manifest?.objects ?? []).map((obj) => ({
      nameSingular: obj.nameSingular,
      namePlural: obj.namePlural,
      labelSingular: obj.labelSingular,
      universalIdentifier: obj.universalIdentifier,
    }));

    const standardObjects = Object.entries(STANDARD_OBJECTS).map(([key, value]) => ({
      nameSingular: key,
      namePlural: this.getPluralName(key),
      labelSingular: convertToLabel(key),
      universalIdentifier: value.universalIdentifier,
    }));

    const { relationType } = await inquirer.prompt<{ relationType: 'one-to-many' | 'one-to-many-polymorphic' }>([
      {
        type: 'select',
        name: 'relationType',
        message: 'Select relation type:',
        choices: [
          { name: 'One-to-many', value: 'one-to-many' },
          { name: 'One-to-many (polymorphic)', value: 'one-to-many-polymorphic' },
        ],
      },
    ]);

    const baseSourceChoices = [
      { name: 'Built-in Twenty objects', value: 'standard' },
    ];
    if (appObjects.length > 0) {
      baseSourceChoices.push({ name: "Current app's defined objects", value: 'app' });
    }
    baseSourceChoices.push({ name: 'Other (write UUID)', value: 'custom' });

    const { baseObjectSource } = await inquirer.prompt<{ baseObjectSource: 'standard' | 'app' | 'custom' }>([
      {
        type: 'select',
        name: 'baseObjectSource',
        message: 'Select source for the base object:',
        choices: baseSourceChoices,
      },
    ]);

    let baseObject: {
      nameSingular: string;
      namePlural: string;
      labelSingular: string;
      universalIdentifier: string;
    };

    if (baseObjectSource === 'standard') {
      const { baseKey } = await inquirer.prompt<{ baseKey: string }>([
        {
          type: 'select',
          name: 'baseKey',
          message: 'Choose the base object:',
          choices: standardObjects.map((obj) => ({ name: obj.labelSingular, value: obj.nameSingular })),
        },
      ]);
      baseObject = standardObjects.find((obj) => obj.nameSingular === baseKey)!;
    } else if (baseObjectSource === 'app') {
      const { baseKey } = await inquirer.prompt<{ baseKey: string }>([
        {
          type: 'select',
          name: 'baseKey',
          message: 'Choose the base object:',
          choices: appObjects.map((obj) => ({ name: obj.labelSingular, value: obj.nameSingular })),
        },
      ]);
      baseObject = appObjects.find((obj) => obj.nameSingular === baseKey)!;
    } else {
      baseObject = await inquirer.prompt([
        {
          type: 'input',
          name: 'nameSingular',
          message: 'Enter name singular for the base object (eg: company):',
          validate: (input) => input.trim().length > 0 || 'Please enter a name',
        },
        {
          type: 'input',
          name: 'namePlural',
          message: 'Enter name plural for the base object (eg: companies):',
          default: (answers: any) => this.getPluralName(answers.nameSingular),
          validate: (input) => input.trim().length > 0 || 'Please enter a name',
        },
        {
          type: 'input',
          name: 'labelSingular',
          message: 'Enter label singular for the base object (eg: Company):',
          default: (answers: any) => convertToLabel(answers.nameSingular),
          validate: (input) => input.trim().length > 0 || 'Please enter a label',
        },
        {
          type: 'input',
          name: 'universalIdentifier',
          message: 'Enter universalIdentifier (UUID) for the base object:',
          validate: (input) => uuidRegex.test(input) || 'Please enter a valid UUID',
        },
      ]);
    }

    const relatedObjects: Array<{
      nameSingular: string;
      namePlural: string;
      labelSingular: string;
      universalIdentifier: string;
    }> = [];

    if (relationType === 'one-to-many') {
      const relSourceChoices = [
        { name: 'Built-in Twenty objects', value: 'standard' },
      ];
      if (appObjects.length > 0) {
        relSourceChoices.push({ name: "Current app's defined objects", value: 'app' });
      }
      relSourceChoices.push({ name: 'Other (write UUID)', value: 'custom' });

      const { relSource } = await inquirer.prompt<{ relSource: 'standard' | 'app' | 'custom' }>([
        {
          type: 'select',
          name: 'relSource',
          message: 'Select source for the related object:',
          choices: relSourceChoices,
        },
      ]);

      let relObj: {
        nameSingular: string;
        namePlural: string;
        labelSingular: string;
        universalIdentifier: string;
      };
      if (relSource === 'standard') {
        const { relKey } = await inquirer.prompt<{ relKey: string }>([
          {
            type: 'select',
            name: 'relKey',
            message: 'Choose the related object:',
            choices: standardObjects.map((obj) => ({ name: obj.labelSingular, value: obj.nameSingular })),
          },
        ]);
        relObj = standardObjects.find((obj) => obj.nameSingular === relKey)!;
      } else if (relSource === 'app') {
        const { relKey } = await inquirer.prompt<{ relKey: string }>([
          {
            type: 'select',
            name: 'relKey',
            message: 'Choose the related object:',
            choices: appObjects.map((obj) => ({ name: obj.labelSingular, value: obj.nameSingular })),
          },
        ]);
        relObj = appObjects.find((obj) => obj.nameSingular === relKey)!;
      } else {
        relObj = await inquirer.prompt<{
          nameSingular: string;
          namePlural: string;
          labelSingular: string;
          universalIdentifier: string;
        }>([
          {
            type: 'input',
            name: 'nameSingular',
            message: 'Enter name singular for the related object (eg: person):',
            validate: (input) => input.trim().length > 0 || 'Please enter a name',
          },
          {
            type: 'input',
            name: 'namePlural',
            message: 'Enter name plural for the related object (eg: people):',
            default: (answers: any) => this.getPluralName(answers.nameSingular),
            validate: (input) => input.trim().length > 0 || 'Please enter a name',
          },
          {
            type: 'input',
            name: 'labelSingular',
            message: 'Enter label singular for the related object (eg: Person):',
            default: (answers: any) => convertToLabel(answers.nameSingular),
            validate: (input) => input.trim().length > 0 || 'Please enter a label',
          },
          {
            type: 'input',
            name: 'universalIdentifier',
            message: 'Enter universalIdentifier (UUID) for the related object:',
            validate: (input) => uuidRegex.test(input) || 'Please enter a valid UUID',
          },
        ]);
      }
      relatedObjects.push(relObj);
    } else {
      const checkboxChoices = [
        ...standardObjects.map((obj) => ({ name: `[Built-in] ${obj.labelSingular}`, value: `standard:${obj.nameSingular}` })),
        ...appObjects.map((obj) => ({ name: `[App] ${obj.labelSingular}`, value: `app:${obj.nameSingular}` })),
        { name: '[Other (write custom UUID...)]', value: 'custom' },
      ];

      const { selectedRelated } = await inquirer.prompt<{ selectedRelated: string[] }>([
        {
          type: 'checkbox',
          name: 'selectedRelated',
          message: 'Select related objects (must select at least 2, or check custom):',
          choices: checkboxChoices,
          validate: (input) => {
            if (input.includes('custom') || input.length >= 2) {
              return true;
            }
            return 'You must select at least 2 related objects (or check custom to add them).';
          },
        },
      ]);

      for (const sel of selectedRelated) {
        if (sel.startsWith('standard:')) {
          const key = sel.replace('standard:', '');
          relatedObjects.push(standardObjects.find((obj) => obj.nameSingular === key)!);
        } else if (sel.startsWith('app:')) {
          const key = sel.replace('app:', '');
          relatedObjects.push(appObjects.find((obj) => obj.nameSingular === key)!);
        }
      }

      if (selectedRelated.includes('custom')) {
        let addMore = true;
        while (addMore) {
          console.log(chalk.cyan(`\n--- Enter details for Custom Related Object #${relatedObjects.length + 1} ---`));
          const customRel = await inquirer.prompt<{
            nameSingular: string;
            namePlural: string;
            labelSingular: string;
            universalIdentifier: string;
            done: boolean;
          }>([
            {
              type: 'input',
              name: 'nameSingular',
              message: 'Enter name singular for this related object:',
              validate: (input) => input.trim().length > 0 || 'Please enter a name',
            },
            {
              type: 'input',
              name: 'namePlural',
              message: 'Enter name plural for this related object:',
              default: (answers) => this.getPluralName(answers.nameSingular),
              validate: (input) => input.trim().length > 0 || 'Please enter a name',
            },
            {
              type: 'input',
              name: 'labelSingular',
              message: 'Enter label singular for this related object:',
              default: (answers) => convertToLabel(answers.nameSingular),
              validate: (input) => input.trim().length > 0 || 'Please enter a label',
            },
            {
              type: 'input',
              name: 'universalIdentifier',
              message: 'Enter universalIdentifier (UUID) for this related object:',
              validate: (input) => uuidRegex.test(input) || 'Please enter a valid UUID',
            },
            {
              type: 'confirm',
              name: 'done',
              message: 'Finished adding custom related objects?',
              default: true,
            },
          ]);

          relatedObjects.push({
            nameSingular: customRel.nameSingular,
            namePlural: customRel.namePlural,
            labelSingular: customRel.labelSingular,
            universalIdentifier: customRel.universalIdentifier,
          });

          if (customRel.done) {
            addMore = false;
          }
        }
      }

      if (relatedObjects.length < 2) {
        console.log(chalk.red('Error: Single-to-polymorphic relations require at least 2 related objects.'));
        process.exit(1);
      }
    }

    const { onDeleteAction } = await inquirer.prompt<{ onDeleteAction: string }>([
      {
        type: 'select',
        name: 'onDeleteAction',
        message: 'Select the onDelete behavior for MANY_TO_ONE side(s):',
        choices: Object.values(RelationOnDeleteAction),
        default: RelationOnDeleteAction.CASCADE,
      },
    ]);

    const fieldsDir = customPath
      ? join(CURRENT_EXECUTION_DIRECTORY, customPath)
      : join(CURRENT_EXECUTION_DIRECTORY, APP_FOLDER, 'fields');

    await ensureDir(fieldsDir);

    const writeFieldFile = async (fileName: string, content: string) => {
      const filePath = join(fieldsDir, fileName);
      if (await pathExists(filePath)) {
        const { overwrite } = await this.handleFileExist();
        if (!overwrite) {
          console.log(chalk.yellow(`Skipped creating: ${relative(CURRENT_EXECUTION_DIRECTORY, filePath)}`));
          return;
        }
      }
      await writeFile(filePath, content);
      console.log(
        chalk.green(`✓ Created field file:`),
        chalk.cyan(relative(CURRENT_EXECUTION_DIRECTORY, filePath)),
      );
    };

    if (relationType === 'one-to-many') {
      const relObj = relatedObjects[0];

      const { baseFieldName } = await inquirer.prompt<{ baseFieldName: string }>([
        {
          type: 'input',
          name: 'baseFieldName',
          message: `Enter field name on base object [${baseObject.nameSingular}]:`,
          default: this.camelCase(relObj.namePlural),
          validate: (input) => /^[a-z][a-zA-Z0-9]*$/.test(input.trim()) || 'Please enter a valid camelCase name',
        },
      ]);

      const { relatedFieldName } = await inquirer.prompt<{ relatedFieldName: string }>([
        {
          type: 'input',
          name: 'relatedFieldName',
          message: `Enter field name on related object [${relObj.nameSingular}]:`,
          default: this.camelCase(baseObject.nameSingular),
          validate: (input) => /^[a-z][a-zA-Z0-9]*$/.test(input.trim()) || 'Please enter a valid camelCase name',
        },
      ]);

      const baseFieldUuid = v4();
      const relatedFieldUuid = v4();

      const baseFieldContent = `import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${baseFieldUuid}',
  objectUniversalIdentifier: '${baseObject.universalIdentifier}',
  type: FieldType.RELATION,
  name: '${baseFieldName}',
  label: '${convertToLabel(baseFieldName)}',
  relationTargetObjectMetadataUniversalIdentifier: '${relObj.universalIdentifier}',
  relationTargetFieldMetadataUniversalIdentifier: '${relatedFieldUuid}',
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
`;

      const relatedFieldContent = `import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${relatedFieldUuid}',
  objectUniversalIdentifier: '${relObj.universalIdentifier}',
  type: FieldType.RELATION,
  name: '${relatedFieldName}',
  label: '${convertToLabel(relatedFieldName)}',
  relationTargetObjectMetadataUniversalIdentifier: '${baseObject.universalIdentifier}',
  relationTargetFieldMetadataUniversalIdentifier: '${baseFieldUuid}',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.${onDeleteAction},
    joinColumnName: '${this.camelCase(relatedFieldName)}Id',
  },
});
`;

      await writeFieldFile(`${kebabCase(baseFieldName)}-on-${kebabCase(baseObject.nameSingular)}.ts`, baseFieldContent);
      await writeFieldFile(`${kebabCase(relatedFieldName)}-on-${kebabCase(relObj.nameSingular)}.ts`, relatedFieldContent);
    } else {
      const morphId = v4();

      for (const relObj of relatedObjects) {
        const { baseFieldName } = await inquirer.prompt<{ baseFieldName: string }>([
          {
            type: 'input',
            name: 'baseFieldName',
            message: `Enter field name on base object [${baseObject.nameSingular}] for related object [${relObj.nameSingular}]:`,
            default: `target${this.capitalize(relObj.nameSingular)}`,
            validate: (input) => /^[a-z][a-zA-Z0-9]*$/.test(input.trim()) || 'Please enter a valid camelCase name',
          },
        ]);

        const { relatedFieldName } = await inquirer.prompt<{ relatedFieldName: string }>([
          {
            type: 'input',
            name: 'relatedFieldName',
            message: `Enter field name on related object [${relObj.nameSingular}]:`,
            default: this.camelCase(baseObject.nameSingular),
            validate: (input) => /^[a-z][a-zA-Z0-9]*$/.test(input.trim()) || 'Please enter a valid camelCase name',
          },
        ]);

        const baseFieldUuid = v4();
        const relatedFieldUuid = v4();

        const baseFieldContent = `import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${baseFieldUuid}',
  objectUniversalIdentifier: '${baseObject.universalIdentifier}',
  type: FieldType.MORPH_RELATION,
  name: '${baseFieldName}',
  label: '${convertToLabel(baseFieldName)}',
  relationTargetObjectMetadataUniversalIdentifier: '${relObj.universalIdentifier}',
  relationTargetFieldMetadataUniversalIdentifier: '${relatedFieldUuid}',
  morphId: '${morphId}',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.${onDeleteAction},
    joinColumnName: '${this.camelCase(baseFieldName)}Id',
  },
});
`;

        const relatedFieldContent = `import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${relatedFieldUuid}',
  objectUniversalIdentifier: '${relObj.universalIdentifier}',
  type: FieldType.RELATION,
  name: '${relatedFieldName}',
  label: '${convertToLabel(relatedFieldName)}',
  relationTargetObjectMetadataUniversalIdentifier: '${baseObject.universalIdentifier}',
  relationTargetFieldMetadataUniversalIdentifier: '${baseFieldUuid}',
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
`;

        await writeFieldFile(`${kebabCase(baseFieldName)}-on-${kebabCase(baseObject.nameSingular)}.ts`, baseFieldContent);
        await writeFieldFile(`${kebabCase(relatedFieldName)}-on-${kebabCase(relObj.nameSingular)}.ts`, relatedFieldContent);
      }
    }
  }

  private getPluralName(singular: string): string {
    const lower = singular.toLowerCase();
    if (lower === 'person') return 'people';
    if (lower === 'company') return 'companies';
    if (lower === 'opportunity') return 'opportunities';

    if (singular.endsWith('y') && !/[aeiou]y$/i.test(singular)) {
      return singular.slice(0, -1) + 'ies';
    }
    if (
      singular.endsWith('s') ||
      singular.endsWith('x') ||
      singular.endsWith('z') ||
      singular.endsWith('ch') ||
      singular.endsWith('sh')
    ) {
      return singular + 'es';
    }
    return singular + 's';
  }

  private camelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (c) => c.toLowerCase());
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
