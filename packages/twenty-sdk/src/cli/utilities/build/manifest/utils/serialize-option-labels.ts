import { isString } from '@sniptt/guards';
import {
  type ApplicationVariable,
  type FieldManifest,
  type ObjectFieldManifest,
  type ServerVariables,
} from 'twenty-shared/application';
import {
  TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER,
  type TranslatableOptionLabelOwner,
} from 'twenty-shared/i18n';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

import {
  type ApplicationConfig,
  type TranslatableApplicationConfig,
} from '@/sdk/define/application/application-config';
import {
  type TranslatableOptionLabel,
  type WithTranslatableFieldOptionLabels,
  type WithTranslatableOptionLabels,
} from '@/sdk/define/common/types/translatable-option-labels.type';
import {
  type ObjectConfig,
  type TranslatableObjectConfig,
} from '@/sdk/define/objects/object-config';
import { type MessageDescriptor } from '@/sdk/front-component/translations/message';

const serializeOptionLabels = <
  TOption extends { label: TranslatableOptionLabel },
>({
  options,
  owner,
  optionLabelMessages,
}: {
  options: TOption[];
  owner: TranslatableOptionLabelOwner;
  optionLabelMessages: MessageDescriptor[];
}): (Omit<TOption, 'label'> & { label: string })[] =>
  options.map(({ label, ...option }) => {
    if (isString(label)) {
      return { ...option, label };
    }

    optionLabelMessages.push({
      message: label.message,
      context: TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER[owner],
    });

    return { ...option, label: label.message };
  });

export const serializeFieldOptionLabels = <
  TField extends FieldManifest | ObjectFieldManifest,
>({
  field,
  optionLabelMessages,
}: {
  field: WithTranslatableFieldOptionLabels<TField>;
  optionLabelMessages: MessageDescriptor[];
}): TField => {
  if (!isFieldMetadataSelectKind(field.type) || !Array.isArray(field.options)) {
    return field as TField;
  }

  return {
    ...field,
    options: serializeOptionLabels<{ label: TranslatableOptionLabel }>({
      options: field.options,
      owner: 'fieldMetadata',
      optionLabelMessages,
    }),
  } as TField;
};

const serializeVariablesOptionLabels = <
  TVariable extends ApplicationVariable | ServerVariables[string],
>({
  variables,
  owner,
  optionLabelMessages,
}: {
  variables: Record<string, WithTranslatableOptionLabels<TVariable>>;
  owner: Exclude<TranslatableOptionLabelOwner, 'fieldMetadata'>;
  optionLabelMessages: MessageDescriptor[];
}): Record<string, TVariable> =>
  Object.fromEntries(
    Object.entries(variables).map(([name, variable]) => [
      name,
      (isDefined(variable.options)
        ? {
            ...variable,
            options: serializeOptionLabels({
              options: variable.options,
              owner,
              optionLabelMessages,
            }),
          }
        : variable) as TVariable,
    ]),
  );

export const serializeObjectOptionLabels = ({
  objectConfig,
  optionLabelMessages,
}: {
  objectConfig: TranslatableObjectConfig;
  optionLabelMessages: MessageDescriptor[];
}): ObjectConfig => ({
  ...objectConfig,
  fields: (objectConfig.fields ?? []).map((field) =>
    serializeFieldOptionLabels<ObjectFieldManifest>({
      field,
      optionLabelMessages,
    }),
  ),
});

export const serializeApplicationOptionLabels = ({
  applicationConfig: {
    applicationVariables,
    serverVariables,
    ...applicationConfig
  },
  optionLabelMessages,
}: {
  applicationConfig: TranslatableApplicationConfig;
  optionLabelMessages: MessageDescriptor[];
}): ApplicationConfig => ({
  ...applicationConfig,
  ...(isDefined(applicationVariables)
    ? {
        applicationVariables:
          serializeVariablesOptionLabels<ApplicationVariable>({
            variables: applicationVariables,
            owner: 'applicationVariable',
            optionLabelMessages,
          }),
      }
    : {}),
  ...(isDefined(serverVariables)
    ? {
        serverVariables: serializeVariablesOptionLabels<
          ServerVariables[string]
        >({
          variables: serverVariables,
          owner: 'serverVariable',
          optionLabelMessages,
        }),
      }
    : {}),
});
