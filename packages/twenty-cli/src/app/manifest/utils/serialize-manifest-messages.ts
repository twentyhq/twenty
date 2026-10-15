import { isString } from '@sniptt/guards';
import {
  mapMessageTranslatableManifestValues,
  type MessageTranslatableManifestEntity,
} from 'twenty-shared/i18n';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ApplicationConfig } from '@/app/manifest/types/application-config.type';
import { type WithSerializedMessages } from '@/app/manifest/types/translatable-text.type';
import { type ObjectConfig } from '@/app/manifest/types/object-config.type';
import { type MessageDescriptor } from '@/app/translations/message';

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
  objectConfig: ObjectConfig;
  messages: MessageDescriptor[];
}): WithSerializedMessages<ObjectConfig> => ({
  ...objectConfig,
  fields: (objectConfig.fields ?? []).map((field) =>
    serializeManifestMessages({
      entity: 'fieldMetadata',
      value: field,
      messages,
    }),
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
  applicationConfig: ApplicationConfig;
  messages: MessageDescriptor[];
}): WithSerializedMessages<ApplicationConfig> => ({
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
