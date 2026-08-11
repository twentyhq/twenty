import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export type InstalledSlackLogicFunction = {
  name: string;
  universalIdentifier: string | null;
  timeoutSeconds: number;
  databaseEventTriggerSettings: unknown;
  httpRouteTriggerSettings: unknown;
  toolTriggerSettings: unknown;
  workflowActionTriggerSettings: unknown;
};

export type InstalledSlackApplication = {
  id: string;
  name: string;
  universalIdentifier: string;
  applicationRegistrationId: string | null;
  logicFunctions: InstalledSlackLogicFunction[];
  agents: Array<{ name: string; label: string }>;
  objects: Array<{ nameSingular: string; universalIdentifier: string }>;
  commandMenuItems: Array<{ label: string; universalIdentifier: string | null }>;
  frontComponents: Array<{ universalIdentifier: string | null }>;
};

export type SlackServerVariable = {
  id: string;
  key: string;
  isSecret: boolean;
  isRequired: boolean;
  isFilled: boolean;
};

export const findInstalledSlackApplication =
  async (): Promise<InstalledSlackApplication> => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findOneApplication: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        id: true,
        name: true,
        universalIdentifier: true,
        applicationRegistrationId: true,
        logicFunctions: {
          name: true,
          universalIdentifier: true,
          timeoutSeconds: true,
          databaseEventTriggerSettings: true,
          httpRouteTriggerSettings: true,
          toolTriggerSettings: true,
          workflowActionTriggerSettings: true,
        },
        agents: { name: true, label: true },
        objects: { nameSingular: true, universalIdentifier: true },
        commandMenuItems: { label: true, universalIdentifier: true },
        frontComponents: { universalIdentifier: true },
      },
    });

    return result.findOneApplication as InstalledSlackApplication;
  };

export const findSlackServerVariables = async (
  applicationRegistrationId: string,
): Promise<SlackServerVariable[]> => {
  const client = new MetadataApiClient();

  const result = await client.query({
    findApplicationRegistrationVariables: {
      __args: { applicationRegistrationId },
      id: true,
      key: true,
      isSecret: true,
      isRequired: true,
      isFilled: true,
    },
  });

  return result.findApplicationRegistrationVariables as SlackServerVariable[];
};

const updateSlackServerVariable = async ({
  applicationRegistrationId,
  key,
  update,
}: {
  applicationRegistrationId: string;
  key: string;
  update: { value?: string; resetValue?: boolean };
}): Promise<void> => {
  const variables = await findSlackServerVariables(applicationRegistrationId);
  const variable = variables.find((candidate) => candidate.key === key);

  if (!variable) {
    throw new Error(
      `The Slack app does not declare a "${key}" server variable (declared: ${variables
        .map((candidate) => candidate.key)
        .join(', ')})`,
    );
  }

  const client = new MetadataApiClient();

  await client.mutation({
    updateApplicationRegistrationVariable: {
      __args: { input: { id: variable.id, update } },
      id: true,
      isFilled: true,
    },
  });
};

export const setSlackServerVariable = ({
  applicationRegistrationId,
  key,
  value,
}: {
  applicationRegistrationId: string;
  key: string;
  value: string;
}): Promise<void> =>
  updateSlackServerVariable({
    applicationRegistrationId,
    key,
    update: { value },
  });

export const clearSlackServerVariable = ({
  applicationRegistrationId,
  key,
}: {
  applicationRegistrationId: string;
  key: string;
}): Promise<void> =>
  updateSlackServerVariable({
    applicationRegistrationId,
    key,
    update: { resetValue: true },
  });
