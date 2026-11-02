import { FieldActorSource } from 'twenty-shared/types';

import { buildAgentRunTurnCreatedBy } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-turn-created-by.util';

const CALLER_APPLICATION = { id: 'caller-application-id', name: 'Caller' };
const MEMBER_ACTOR = {
  source: FieldActorSource.MANUAL,
  name: 'Ada Lovelace',
  workspaceMemberId: 'member-id',
  context: {},
};
const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  application: { id: 'auth-application-id', name: 'Auth app' },
};

describe('buildAgentRunTurnCreatedBy', () => {
  it('keeps the calling application on a turn it runs as a member', () => {
    expect(
      buildAgentRunTurnCreatedBy({
        actorContext: MEMBER_ACTOR,
        callerApplication: CALLER_APPLICATION as never,
        authContext: APPLICATION_AUTH_CONTEXT as never,
      }),
    ).toEqual({
      ...MEMBER_ACTOR,
      context: { applicationId: CALLER_APPLICATION.id },
    });
  });

  it('credits a member turn to the member alone without a calling application', () => {
    expect(
      buildAgentRunTurnCreatedBy({
        actorContext: MEMBER_ACTOR,
        callerApplication: undefined,
        authContext: APPLICATION_AUTH_CONTEXT as never,
      }),
    ).toEqual(MEMBER_ACTOR);
  });

  it('credits a turn without a member to the calling application', () => {
    expect(
      buildAgentRunTurnCreatedBy({
        actorContext: undefined,
        callerApplication: CALLER_APPLICATION as never,
        authContext: APPLICATION_AUTH_CONTEXT as never,
      }),
    ).toMatchObject({
      workspaceMemberId: null,
      context: { applicationId: CALLER_APPLICATION.id },
    });
  });

  it('credits a turn without a member or calling application to whoever authenticated', () => {
    expect(
      buildAgentRunTurnCreatedBy({
        actorContext: undefined,
        callerApplication: undefined,
        authContext: APPLICATION_AUTH_CONTEXT as never,
      }),
    ).toMatchObject({
      workspaceMemberId: null,
      context: { applicationId: APPLICATION_AUTH_CONTEXT.application.id },
    });
  });
});
