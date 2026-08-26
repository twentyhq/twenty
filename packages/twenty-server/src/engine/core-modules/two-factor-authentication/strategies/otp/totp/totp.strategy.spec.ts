import { authenticator } from 'otplib';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { TwoFactorAuthenticationException } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';

import { TotpStrategy } from './totp.strategy';

import {
  TOTPHashAlgorithms,
  type TotpContext,
} from './constants/totp.strategy.constants';

const FIXED_EPOCH_MS = 1_700_000_000_000;
const STEP_DURATION_MS = 30 * 1000;

const generateTokenAtEpoch = (secret: string, epochMs: number): string =>
  authenticator.clone({ epoch: epochMs }).generate(secret);

describe('TOTPStrategy Configuration', () => {
  let strategy: TotpStrategy;
  let secret: string;
  let context: TotpContext;

  beforeEach(() => {
    secret = authenticator.generateSecret();
  });

  describe('Valid Configurations', () => {
    it('should create a strategy with default options', () => {
      expect(() => new TotpStrategy()).not.toThrow();
    });

    it('should create a strategy with valid custom options', () => {
      const validOptions = {
        algorithm: TOTPHashAlgorithms.SHA1,
        digits: 6,
        step: 30,
        window: 1,
      };

      expect(() => new TotpStrategy(validOptions)).not.toThrow();
    });

    it('should accept a large window', () => {
      expect(() => new TotpStrategy({ window: 10 })).not.toThrow();
    });
  });

  describe('Invalid Configurations', () => {
    it('should throw for a negative window', () => {
      expect(() => new TotpStrategy({ window: -1 })).toThrow(
        TwoFactorAuthenticationException,
      );
    });

    it('should throw for digits below the minimum', () => {
      expect(() => new TotpStrategy({ digits: 4 })).toThrow(
        TwoFactorAuthenticationException,
      );
    });
  });

  describe('initiate', () => {
    beforeEach(() => {
      strategy = new TotpStrategy();
    });

    it('should generate a valid TOTP URI', () => {
      const result = strategy.initiate('test@example.com', 'TestApp');

      expect(result.uri).toMatch(/^otpauth:\/\/totp\//);
      expect(result.uri).toContain('test%40example.com'); // URL encoded email
      expect(result.uri).toContain('TestApp');
      expect(result.context.status).toBe(OTPStatus.PENDING);
      expect(result.context.secret).toBeDefined();
    });

    it('should generate different secrets for each call', () => {
      const result1 = strategy.initiate('test1@example.com', 'TestApp');
      const result2 = strategy.initiate('test2@example.com', 'TestApp');

      expect(result1.context.secret).not.toBe(result2.context.secret);
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      strategy = new TotpStrategy({ window: 1, epoch: FIXED_EPOCH_MS });

      context = {
        status: OTPStatus.VERIFIED,
        secret: secret as PlaintextString,
      };
    });

    it('should return true for a valid token at the current counter', () => {
      const token = generateTokenAtEpoch(secret, FIXED_EPOCH_MS);

      const result = strategy.validate(token, context);

      expect(result.isValid).toBe(true);
    });

    it('should return false for an invalid token', () => {
      const token = '000000';
      const result = strategy.validate(token, context);

      expect(result.isValid).toBe(false);
    });

    it('should accept the previous token within the window', () => {
      const previousToken = generateTokenAtEpoch(
        secret,
        FIXED_EPOCH_MS - STEP_DURATION_MS,
      );

      const result = strategy.validate(previousToken, context);

      expect(result.isValid).toBe(true);
    });

    it('should accept the next token within the window', () => {
      const nextToken = generateTokenAtEpoch(
        secret,
        FIXED_EPOCH_MS + STEP_DURATION_MS,
      );

      const result = strategy.validate(nextToken, context);

      expect(result.isValid).toBe(true);
    });

    it('should reject a token generated outside the window', () => {
      const staleToken = generateTokenAtEpoch(
        secret,
        FIXED_EPOCH_MS - 2 * STEP_DURATION_MS,
      );

      const result = strategy.validate(staleToken, context);

      expect(result.isValid).toBe(false);
    });

    it('should reject the previous token when no window is configured', () => {
      const strategyWithoutWindow = new TotpStrategy({
        epoch: FIXED_EPOCH_MS,
      });
      const previousToken = generateTokenAtEpoch(
        secret,
        FIXED_EPOCH_MS - STEP_DURATION_MS,
      );

      const result = strategyWithoutWindow.validate(previousToken, context);

      expect(result.isValid).toBe(false);
    });

    it('should handle invalid secret gracefully', () => {
      const invalidContext = {
        status: OTPStatus.VERIFIED,
        secret: 'invalid-secret' as PlaintextString,
      };

      const result = strategy.validate('123456', invalidContext);

      expect(result.isValid).toBe(false);
    });

    it('should handle empty secret gracefully', () => {
      const invalidContext = {
        status: OTPStatus.VERIFIED,
        secret: '' as PlaintextString,
      };

      const result = strategy.validate('123456', invalidContext);

      expect(result.isValid).toBe(false);
    });

    it('should return the original context on validation success', () => {
      const initResult = strategy.initiate('test@example.com', 'TestApp');
      const token = generateTokenAtEpoch(
        initResult.context.secret,
        FIXED_EPOCH_MS,
      );

      const result = strategy.validate(token, initResult.context);

      expect(result.context).toBe(initResult.context);
      expect(result.context.status).toBe(OTPStatus.PENDING); // initiate returns PENDING
    });

    it('should return the original context on validation failure', () => {
      const token = '000000';
      const result = strategy.validate(token, context);

      expect(result.context).toBe(context);
      expect(result.context.status).toBe(OTPStatus.VERIFIED);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      strategy = new TotpStrategy();
    });

    it('should handle empty token gracefully', () => {
      const errorHandlingContext = {
        status: OTPStatus.VERIFIED,
        secret: secret as PlaintextString,
      };

      const result = strategy.validate('', errorHandlingContext);

      expect(result.isValid).toBe(false);
      expect(result.context.status).toBe(OTPStatus.VERIFIED);
    });

    it('should handle null token gracefully', () => {
      const errorHandlingContext = {
        status: OTPStatus.VERIFIED,
        secret: secret as PlaintextString,
      };

      const result = strategy.validate(
        null as unknown as string,
        errorHandlingContext,
      );

      expect(result.isValid).toBe(false);
      expect(result.context.status).toBe(OTPStatus.VERIFIED);
    });
  });
});
