import { beforeAll, describe, expect, it } from 'vitest';

import {
  SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SEND_SLACK_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
  SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
  SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
  SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
  SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
  SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  findInstalledSlackApplication,
  findSlackServerVariables,
  type InstalledSlackApplication,
  type InstalledSlackLogicFunction,
  type SlackServerVariable,
} from 'src/__tests__/utils/slack-application';

const EXPECTED_LOGIC_FUNCTIONS: Record<string, string> = {
  [SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER]: 'slack-post-message',
  [SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER]:
    'slack-post-ephemeral-message',
  [SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER]: 'slack-update-message',
  [SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER]: 'slack-delete-message',
  [SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER]: 'slack-add-reaction',
  [SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER]: 'slack-list-channels',
  [SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER]: 'slack-list-channels-route',
  [SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER]: 'slack-post-message-route',
  [SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER]: 'slack-events-resolver',
  [SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER]: 'slack-events-enqueue',
  [SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER]: 'slack-channel-welcome',
  [SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER]: 'slack-home-opened',
  [SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER]: 'slack-assistant-worker',
  [SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER]: 'slack-register-connection',
  [SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]:
    'slack-team-release',
  [SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]:
    'slack-app-uninstall',
};

describe('Slack app manifest', () => {
  let application: InstalledSlackApplication;
  let serverVariables: SlackServerVariable[];

  const findLogicFunction = (
    universalIdentifier: string,
  ): InstalledSlackLogicFunction => {
    const logicFunction = application.logicFunctions.find(
      (candidate) => candidate.universalIdentifier === universalIdentifier,
    );

    if (!logicFunction) {
      throw new Error(`Logic function ${universalIdentifier} is not installed`);
    }

    return logicFunction;
  };

  beforeAll(async () => {
    application = await findInstalledSlackApplication();

    if (!application.applicationRegistrationId) {
      throw new Error('The Slack app has no application registration');
    }

    serverVariables = await findSlackServerVariables(
      application.applicationRegistrationId,
    );
  });

  it('should install every declared logic function', () => {
    const installedByUniversalIdentifier = new Map(
      application.logicFunctions.map((logicFunction) => [
        logicFunction.universalIdentifier,
        logicFunction.name,
      ]),
    );

    for (const [universalIdentifier, name] of Object.entries(
      EXPECTED_LOGIC_FUNCTIONS,
    )) {
      expect(installedByUniversalIdentifier.get(universalIdentifier)).toBe(name);
    }
  });

  it('should expose the message tools as both agent tools and workflow actions', () => {
    const toolUniversalIdentifiers = [
      SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
      SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
      SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
      SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
      SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
      SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
    ];

    for (const universalIdentifier of toolUniversalIdentifiers) {
      const logicFunction = findLogicFunction(universalIdentifier);

      expect(logicFunction.toolTriggerSettings).toBeTruthy();
      expect(logicFunction.workflowActionTriggerSettings).toBeTruthy();
    }
  });

  it('should expose the authenticated HTTP routes used by the front component', () => {
    expect(
      findLogicFunction(SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER)
        .httpRouteTriggerSettings,
    ).toMatchObject({
      path: '/slack/messages',
      httpMethod: 'POST',
      isAuthRequired: true,
    });

    expect(
      findLogicFunction(SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER)
        .httpRouteTriggerSettings,
    ).toMatchObject({
      path: '/slack/channels',
      httpMethod: 'GET',
      isAuthRequired: true,
    });
  });

  it('should run the assistant worker on slack assistant request creation', () => {
    const worker = findLogicFunction(SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER);

    expect(worker.databaseEventTriggerSettings).toMatchObject({
      eventName: 'slackAssistantRequest.created',
    });
    expect(worker.timeoutSeconds).toBe(240);
  });

  it('should install the slack assistant request object', () => {
    expect(application.objects).toContainEqual(
      expect.objectContaining({
        nameSingular: 'slackAssistantRequest',
        universalIdentifier: SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should install the assistant agent, the command menu item and its front component', () => {
    expect(application.agents).toContainEqual(
      expect.objectContaining({ name: 'slack-assistant' }),
    );

    expect(application.commandMenuItems).toContainEqual(
      expect.objectContaining({
        universalIdentifier: SEND_SLACK_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
        label: 'Send Slack message',
      }),
    );

    expect(application.frontComponents).toContainEqual(
      expect.objectContaining({
        universalIdentifier:
          SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should declare the Slack OAuth and webhook server variables', () => {
    expect(serverVariables).toContainEqual(
      expect.objectContaining({
        key: 'SLACK_CLIENT_ID',
        isSecret: false,
        isRequired: true,
      }),
    );
    expect(serverVariables).toContainEqual(
      expect.objectContaining({
        key: 'SLACK_CLIENT_SECRET',
        isSecret: true,
        isRequired: true,
      }),
    );
    expect(serverVariables).toContainEqual(
      expect.objectContaining({
        key: 'SLACK_WEBHOOK_SECRET',
        isSecret: true,
        isRequired: false,
      }),
    );
  });
});
