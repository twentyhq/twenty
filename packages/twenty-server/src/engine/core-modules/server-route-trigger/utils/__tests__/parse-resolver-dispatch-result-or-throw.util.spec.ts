import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { parseResolverDispatchResultOrThrow } from 'src/engine/core-modules/server-route-trigger/utils/parse-resolver-dispatch-result-or-throw.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TARGET_UNIVERSAL_IDENTIFIER = 'c4e2a9b1-7d4e-4c9a-9f2b-2e1d6a4c8e10';

const expectInvalidResult = (data: unknown) =>
  expect(() => parseResolverDispatchResultOrThrow(data)).toThrow(
    expect.objectContaining({
      code: ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    }),
  );

describe('parseResolverDispatchResultOrThrow', () => {
  it('should return the dispatch target when the resolver returns one', () => {
    expect(
      parseResolverDispatchResultOrThrow({
        workspaceId: WORKSPACE_ID,
        targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should keep the payload when the resolver transforms it', () => {
    expect(
      parseResolverDispatchResultOrThrow({
        workspaceId: WORKSPACE_ID,
        targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payload: { event: 'invoice.paid' },
      }).payload,
    ).toEqual({ event: 'invoice.paid' });
  });

  it('should drop keys that are not part of the dispatch contract', () => {
    expect(
      parseResolverDispatchResultOrThrow({
        workspaceId: WORKSPACE_ID,
        targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        applicationRegistrationId: 'smuggled',
      }),
    ).toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should throw RESOLVER_INVALID_RESULT when the workspaceId is missing', () => {
    expectInvalidResult({
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should throw RESOLVER_INVALID_RESULT when the target identifier is missing', () => {
    expectInvalidResult({ workspaceId: WORKSPACE_ID });
  });

  it('should throw RESOLVER_INVALID_RESULT when an identifier is not a uuid', () => {
    expectInvalidResult({
      workspaceId: '',
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });
    expectInvalidResult({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: 'handle-invoice-paid',
    });
  });

  it('should throw RESOLVER_INVALID_RESULT when the payload is not an object', () => {
    expectInvalidResult({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payload: 'not-an-object',
    });
  });

  it('should throw RESOLVER_INVALID_RESULT when the resolver returns nothing', () => {
    expectInvalidResult(null);
    expectInvalidResult(undefined);
  });
});
