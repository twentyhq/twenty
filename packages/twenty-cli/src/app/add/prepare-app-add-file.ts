import { isValidUniversalIdentifier } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { convertToLabel } from '@/app/convert-to-label';
import { APP_ADD_ENTITIES } from '@/app/add/constants/app-add-entities.constant';
import { getFieldBaseFile } from '@/app/add/entity-field-template';
import { getFrontComponentBaseFile } from '@/app/add/entity-front-component-template';
import { getLogicFunctionBaseFile } from '@/app/add/entity-logic-function-template';
import { getObjectBaseFile } from '@/app/add/entity-object-template';
import { promptForAppAddValue } from '@/app/add/prompt-for-app-add-value';
import { kebabCase } from '@/app/pull/kebab-case';
import {
  readStringArgument,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

const invalidInput = (message: string) =>
  new CliError({
    code: 'USAGE',
    exitCode: EXIT_CODE.USAGE,
    message,
    hint: 'Run twenty app add --help for options and examples.',
  });

export const prepareAppAddFile = async (context: CommandContext) => {
  const { options, signal } = context;
  const interactive = isInteractionAllowed(context);
  const readValue = async ({
    option,
    label,
    value = readStringOption(options, option),
    defaultValue,
    choices,
  }: {
    option: string;
    label: string;
    value?: string;
    defaultValue?: string;
    choices?: readonly string[];
  }): Promise<string> => {
    signal.throwIfAborted();

    if (!isDefined(value) && interactive) {
      const choiceHint = choices ? ` (${choices.join(', ')})` : '';
      const defaultHint = isDefined(defaultValue) ? ` [${defaultValue}]` : '';

      value = await promptForAppAddValue({
        question: `${label}${choiceHint}${defaultHint}: `,
        signal,
      });
      value = value.trim() || defaultValue;
    } else {
      value = value?.trim() ?? defaultValue;
    }

    if (!isDefined(value) || (value.length === 0 && defaultValue !== '')) {
      throw invalidInput(
        `Missing ${label.toLowerCase()}. Provide ${option === 'entity' ? 'an entity argument' : `--${kebabCase(option)}`}.`,
      );
    }

    if (choices && !choices.includes(value)) {
      throw invalidInput(
        `Invalid ${label.toLowerCase()}: ${value}. Expected ${choices.join(', ')}.`,
      );
    }

    return value;
  };
  const readIdentifier = async (option: string, label: string) => {
    const value = await readValue({ option, label });

    if (!isValidUniversalIdentifier(value)) {
      throw invalidInput(`${label} must be a UUID (version 4 or later).`);
    }

    return value;
  };
  const entity = await readValue({
    option: 'entity',
    label: 'Entity',
    value: readStringArgument(context.arguments, 0),
    choices: APP_ADD_ENTITIES,
  });
  const objectOptions = ['namePlural', 'labelPlural'];
  const fieldOptions = ['type', 'object', 'description'];
  const relationOptions = [
    'targetObject',
    'targetField',
    'relationType',
    'onDelete',
  ];
  const rejectOptions = (names: string[]) => {
    const supplied = names.filter((option) =>
      isDefined(readStringOption(options, option)),
    );

    if (supplied.length > 0) {
      throw invalidInput(
        `Options do not apply to this definition: ${supplied.map((option) => `--${kebabCase(option)}`).join(', ')}.`,
      );
    }
  };

  if (entity !== 'object') rejectOptions(objectOptions);
  if (entity !== 'field') rejectOptions([...fieldOptions, ...relationOptions]);
  if (entity !== 'object' && entity !== 'field') rejectOptions(['label']);

  const name = await readValue({ option: 'name', label: 'Name' });
  const fileName = kebabCase(name);

  if (!/[a-z0-9]/.test(fileName)) {
    throw invalidInput('Name must contain at least one ASCII letter or digit.');
  }

  let content: string;

  switch (entity) {
    case 'object': {
      const namePlural = await readValue({
        option: 'namePlural',
        label: 'Plural name',
      });

      if (namePlural === name) {
        throw invalidInput('Singular and plural object names must differ.');
      }

      const labelSingular = await readValue({
        option: 'label',
        label: 'Singular label',
        defaultValue: convertToLabel(name),
      });
      const labelPlural = await readValue({
        option: 'labelPlural',
        label: 'Plural label',
        defaultValue: convertToLabel(namePlural),
      });

      content = getObjectBaseFile({
        name,
        data: { nameSingular: name, namePlural, labelSingular, labelPlural },
      });
      break;
    }
    case 'field': {
      const label = await readValue({
        option: 'label',
        label: 'Label',
        defaultValue: convertToLabel(name),
      });
      const typeValue = await readValue({
        option: 'type',
        label: 'Field type',
        defaultValue: FieldMetadataType.TEXT,
        choices: Object.values(FieldMetadataType),
      });
      const type = Object.values(FieldMetadataType).find(
        (candidate) => candidate === typeValue,
      );

      if (!isDefined(type)) {
        throw invalidInput(`Invalid field type: ${typeValue}.`);
      }

      const objectUniversalIdentifier = await readIdentifier(
        'object',
        'Parent object universal identifier',
      );
      const description = await readValue({
        option: 'description',
        label: 'Description',
        defaultValue: '',
      });
      const data: Parameters<typeof getFieldBaseFile>[0]['data'] = {
        name,
        label,
        type,
        objectUniversalIdentifier,
        description,
      };

      if (
        type === FieldMetadataType.RELATION ||
        type === FieldMetadataType.MORPH_RELATION
      ) {
        data.relationTargetObjectMetadataUniversalIdentifier =
          await readIdentifier(
            'targetObject',
            'Target object universal identifier',
          );
        data.relationTargetFieldMetadataUniversalIdentifier =
          await readIdentifier(
            'targetField',
            'Target field universal identifier',
          );
        const relationType = await readValue({
          option: 'relationType',
          label: 'Relation type',
          defaultValue: RelationType.ONE_TO_MANY,
          choices: Object.values(RelationType),
        });
        const onDelete = await readValue({
          option: 'onDelete',
          label: 'On delete',
          defaultValue: RelationOnDeleteAction.CASCADE,
          choices: [...Object.values(RelationOnDeleteAction), 'None'],
        });

        data.relationType = Object.values(RelationType).find(
          (candidate) => candidate === relationType,
        );
        data.onDelete =
          onDelete === 'None'
            ? 'None'
            : Object.values(RelationOnDeleteAction).find(
                (candidate) => candidate === onDelete,
              );
      } else {
        rejectOptions(relationOptions);
      }

      content = getFieldBaseFile({ name, data });
      break;
    }
    case 'logic-function':
      content = getLogicFunctionBaseFile({ name });
      break;
    case 'front-component':
      content = getFrontComponentBaseFile({ name });
      break;
    default:
      throw invalidInput(`Unsupported entity: ${entity}.`);
  }

  return {
    entity,
    name,
    path: `src/${entity}s/${fileName}.${entity === 'front-component' ? 'tsx' : 'ts'}`,
    content,
  };
};
