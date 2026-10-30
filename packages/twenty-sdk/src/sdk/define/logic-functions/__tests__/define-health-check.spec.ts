import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  defineHealthCheck,
  type HealthCheckHandler,
  type HealthCheckLogicFunctionConfig,
} from '@/sdk/define';

describe('defineHealthCheck', () => {
  const VALID_CONFIG = {
    universalIdentifier: '7f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
    name: 'health-check',
    handler: async () => ({ status: 'OK' as const }),
  };

  it('preserves the original zero-argument workspace handler when omitted', async () => {
    const result = defineHealthCheck(VALID_CONFIG);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(VALID_CONFIG);
    expect(result.errors).toEqual([]);
    expectTypeOf(result.config.handler).toEqualTypeOf<HealthCheckHandler>();
    expectTypeOf(result.config.handler).parameters.toEqualTypeOf<[]>();
    await expect(result.config.handler()).resolves.toEqual({ status: 'OK' });
  });

  it('preserves the original zero-argument workspace handler when false', async () => {
    const result = defineHealthCheck({
      ...VALID_CONFIG,
      runOnUserPreferences: false,
    });

    expect(result.success).toBe(true);
    expect(result.config.runOnUserPreferences).toBe(false);
    expectTypeOf(result.config.handler).toEqualTypeOf<HealthCheckHandler>();
    expectTypeOf(result.config.handler).parameters.toEqualTypeOf<[]>();
    await expect(result.config.handler()).resolves.toEqual({ status: 'OK' });
  });

  it('requires the member object and infers a non-null identity when true', async () => {
    const result = defineHealthCheck({
      ...VALID_CONFIG,
      runOnUserPreferences: true,
      handler: async ({ userWorkspaceId }) => {
        expectTypeOf(userWorkspaceId).toEqualTypeOf<string>();

        return { status: 'INFO', title: userWorkspaceId };
      },
    });

    expect(result.success).toBe(true);
    expect(result.config.runOnUserPreferences).toBe(true);
    expectTypeOf(result.config.handler).parameters.toEqualTypeOf<
      [parameters: { userWorkspaceId: string }]
    >();
    await expect(
      result.config.handler({ userWorkspaceId: 'first-member' }),
    ).resolves.toEqual({ status: 'INFO', title: 'first-member' });
    await expect(
      result.config.handler({ userWorkspaceId: 'second-member' }),
    ).resolves.toEqual({ status: 'INFO', title: 'second-member' });
  });

  it('keeps the member parameter required when the authored handler ignores it', async () => {
    const result = defineHealthCheck({
      ...VALID_CONFIG,
      runOnUserPreferences: true,
    });

    expectTypeOf(result.config.handler).parameters.toEqualTypeOf<
      [parameters: { userWorkspaceId: string }]
    >();
    await expect(
      result.config.handler({ userWorkspaceId: 'member-id' }),
    ).resolves.toEqual({ status: 'OK' });
  });

  it.each([false, true])(
    'accepts a forwarded config union with mode %s',
    async (runOnUserPreferences) => {
      const config: HealthCheckLogicFunctionConfig = runOnUserPreferences
        ? {
            ...VALID_CONFIG,
            runOnUserPreferences: true,
            handler: ({ userWorkspaceId }) => ({
              status: 'INFO',
              title: userWorkspaceId,
            }),
          }
        : VALID_CONFIG;
      const result = defineHealthCheck(config);

      expect(result.success).toBe(true);
      if (result.config.runOnUserPreferences) {
        expectTypeOf(result.config.handler).parameters.toEqualTypeOf<
          [parameters: { userWorkspaceId: string }]
        >();
        await expect(
          Promise.resolve(
            result.config.handler({ userWorkspaceId: 'member-id' }),
          ),
        ).resolves.toEqual({ status: 'INFO', title: 'member-id' });
      } else {
        expectTypeOf(result.config.handler).parameters.toEqualTypeOf<[]>();
        await expect(result.config.handler()).resolves.toEqual({
          status: 'OK',
        });
      }
    },
  );

  it('rejects incompatible handler declarations at the type level', () => {
    const memberHandler = ({
      userWorkspaceId,
    }: {
      userWorkspaceId: string;
    }) => ({ status: 'INFO' as const, title: userWorkspaceId });

    const missingModeConfig = { ...VALID_CONFIG, handler: memberHandler };
    const workspaceModeConfig = {
      ...VALID_CONFIG,
      runOnUserPreferences: false,
      handler: memberHandler,
    };
    const positionalHandlerConfig = {
      ...VALID_CONFIG,
      runOnUserPreferences: true,
      handler: (userWorkspaceId: string) => ({
        status: 'INFO' as const,
        title: userWorkspaceId,
      }),
    };

    // @ts-expect-error Member handlers require runOnUserPreferences: true.
    defineHealthCheck(missingModeConfig);
    // @ts-expect-error Workspace handlers cannot require a member parameter.
    defineHealthCheck(workspaceModeConfig);
    // @ts-expect-error Member handlers receive an object, not a positional ID.
    defineHealthCheck(positionalHandlerConfig);

    expectTypeOf(memberHandler).parameters.toEqualTypeOf<
      [parameters: { userWorkspaceId: string }]
    >();
  });

  it('rejects a non-boolean option from a JavaScript declaration', () => {
    const invalidConfig = { ...VALID_CONFIG, runOnUserPreferences: 'true' };
    // @ts-expect-error JavaScript apps can pass invalid options.
    const result = defineHealthCheck(invalidConfig);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      'Health check runOnUserPreferences must be a boolean',
    ]);
  });

  it('rejects a missing universalIdentifier', () => {
    const invalidConfig = {
      name: 'health-check',
      handler: VALID_CONFIG.handler,
    };
    // @ts-expect-error JavaScript apps can omit required fields.
    const result = defineHealthCheck(invalidConfig);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      'Health check must have a universalIdentifier',
    ]);
  });

  it('rejects a missing handler', () => {
    const invalidConfig = {
      universalIdentifier: VALID_CONFIG.universalIdentifier,
      name: 'health-check',
    };
    // @ts-expect-error JavaScript apps can omit required fields.
    const result = defineHealthCheck(invalidConfig);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Health check must have a handler']);
  });

  it('rejects a handler that is not a function', () => {
    const invalidConfig = { ...VALID_CONFIG, handler: 'not-a-function' };
    // @ts-expect-error JavaScript apps can pass invalid handlers.
    const result = defineHealthCheck(invalidConfig);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Health check handler must be a function']);
  });
});
