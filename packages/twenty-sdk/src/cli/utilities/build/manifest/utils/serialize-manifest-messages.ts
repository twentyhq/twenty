import { isString } from '@sniptt/guards';
import {
  mapMessageTranslatableManifestValues,
  type MessageTranslatableManifestEntity,
} from 'twenty-shared/i18n';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ApplicationConfig,
  type TranslatableApplicationConfig,
} from '@/sdk/define/application/application-config';
import { type WithSerializedMessages } from '@/sdk/define/common/types/translatable-text.type';
import {
  type ObjectConfig,
  type TranslatableObjectConfig,
} from '@/sdk/define/objects/object-config';
import { type MessageDescriptor } from '@/sdk/front-component/translations/message';

export const serializeManifestMessages = <TValue>({
  entity,
  value,
  messages,
}: {
  entity: MessageTranslatableManifestEntity;
  value: TValue;
  messages: MessageDescriptor[];
}): WithSerializedMessages<TValue> =>
  mapMessageTranslatableManifestValues<TValue, WithSerializedMessages<TValue>>({
    entity,
    value,
    mapValue: ({ value: text, context }) => {
      if (!isPlainObject(text) || !isString(text.message)) {
        return text;
      }

      messages.push({ message: text.message, context });

      return text.message;
    },
  });

const serializeEachManifestMessages = <TValue>({
  entity,
  values,
  messages,
}: {
  entity: MessageTranslatableManifestEntity;
  values: Record<string, TValue>;
  messages: MessageDescriptor[];
}): Record<string, WithSerializedMessages<TValue>> =>
  Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      serializeManifestMessages({ entity, value, messages }),
    ]),
  );

export const serializeObjectMessages = ({
  objectConfig,
  messages,
}: {
  objectConfig: TranslatableObjectConfig;
  messages: MessageDescriptor[];
}): ObjectConfig => ({
  ...objectConfig,
  fields: (objectConfig.fields ?? []).map((field) =>
    serializeManifestMessages({ entity: 'fieldMetadata', value: field, messages }),
  ),
});

export const serializeApplicationMessages = ({
  applicationConfig: {
    applicationVariables,
    serverVariables,
    ...applicationConfig
  },
  messages,
}: {
  applicationConfig: TranslatableApplicationConfig;
  messages: MessageDescriptor[];
}): ApplicationConfig => ({
  ...serializeManifestMessages({
    entity: 'application',
    value: applicationConfig,
    messages,
  }),
  ...(isDefined(applicationVariables)
    ? {
        applicationVariables: serializeEachManifestMessages({
          entity: 'applicationVariable',
          values: applicationVariables,
          messages,
        }),
      }
    : {}),
  ...(isDefined(serverVariables)
    ? {
        serverVariables: serializeEachManifestMessages({
          entity: 'serverVariable',
          values: serverVariables,
          messages,
        }),
      }
    : {}),
});
