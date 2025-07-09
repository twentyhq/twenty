import { Logger } from '@nestjs/common';
import { HotpStrategy, HOTPStrategyConfig } from './hotp.strategy';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from '../two-factor-authentication.exception';
import { HotpContext, OTPHashAlgorithms, OTPKeyEncodings } from '../two-factor-authentication.interface';
import { hotp } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

describe('HOTPStrategy Configuration', () => {
  let warnSpy: jest.SpyInstance;

  const validOptions: HOTPStrategyConfig = {
    algorithm: OTPHashAlgorithms.SHA256,
    digits: 8,
    encodings: OTPKeyEncodings.HEX,
    window: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  describe('Valid Configurations', () => {
    it('should instantiate with default options when none are provided', () => {
      expect(() => new HotpStrategy()).not.toThrow();
    });

    it('should instantiate with all valid custom options', () => {
      expect(() => new HotpStrategy(validOptions)).not.toThrow();
    });

    it('should warn when all custom options are valid but not recommended', () => {
        const authenticatorIncompatibleOptions = {
            ...validOptions,
            algorithm: OTPHashAlgorithms.SHA256,
            encodings: OTPKeyEncodings.BASE64,
        };

        expect(
            () => new HotpStrategy(authenticatorIncompatibleOptions)
        ).not.toThrow();

        expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('should correctly set the window property', () => {
      const strategy = new HotpStrategy({ window: 10 });
      expect((strategy as any).window).toBe(10);
    });

    it('should default window to 0 if not provided', () => {
        const strategy = new HotpStrategy();
        expect((strategy as any).window).toBe(0);
    });
  });

  describe('Invalid Configurations (Error Handling)', () => {
    it('should throw TwoFactorAuthenticationException for an invalid algorithm', () => {
        const invalidOptions = { 
            digits: 5,
            algorithm: 'MD5' as OTPHashAlgorithms,
            encodings: 'utf-8' as OTPKeyEncodings,
            window: -1
        };

      expect.assertions(6);

      try {
        new HotpStrategy(invalidOptions)
      } catch (e) {
          expect(e).toBeInstanceOf(TwoFactorAuthenticationException);
          expect(e.code).toEqual(TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION)
          expect(e.message).toContain('digits')
          expect(e.message).toContain('algorithm')
          expect(e.message).toContain('encodings')
          expect(e.message).toContain('window')
      }
    });
  });

  describe('initiate', () => {
    it('should return a valid URI and context object', () => {
      const strategy = new HotpStrategy();
      const accountName = 'test@example.com';
      const issuer = 'MyAwesomeApp';

      const result = strategy.initiate(accountName, issuer, 0);

      expect(result.uri).toContain(`otpauth://hotp/${issuer}:${encodeURIComponent(accountName)}`);
      expect(result.uri).toContain(`?secret=${result.context.secret}`);
      expect(result.uri).toContain(`&issuer=${issuer}`);
      expect(result.uri).toContain(`&counter=0`);

      expect(result.context).toEqual({
        strategy: 'HOTP',
        status: 'PENDING',
        counter: 0,
        secret: expect.any(String)
      });
    });
  });

  describe('validate', () => {
    let strategy: HotpStrategy;
    const secret = 'KVKFKRCPNZQUYMLXOVYDSKJK';
    const RESYNCH_WINDOW = 3;
    let context: HotpContext;

    beforeEach(() => {
      strategy = new HotpStrategy({ window: RESYNCH_WINDOW }); 
      context = {
        strategy: TwoFactorAuthenticationStrategy.HOTP,
        status: 'VERIFIED' as const,
        secret,
        counter: 1,
      };
    });

    it('should return true for a valid token at the current counter', () => {
      const token = hotp.generate(secret, 1);
      const result = strategy.validate(token, context);

      expect(result.isValid).toBe(true);
      expect(result.context.counter).toBe(2); 
    });

    it('should return false for an invalid token', () => {
      const token = '000000';
      const result = strategy.validate(token, context);

      expect(result.isValid).toBe(false);
      expect(result.context.counter).toBe(1); 
    });

    it('should succeed and resynchronize if the token is valid within the window', () => {
      const futureToken = hotp.generate(secret, RESYNCH_WINDOW); 
      const result = strategy.validate(futureToken, context);

      expect(result.isValid).toBe(true);
      expect(result.context.counter).toBe(4); 
    });

    it('should fail if the token is valid but outside the window', () => {
      const futureToken = hotp.generate(secret, 5); 
      const result = strategy.validate(futureToken, context);

      expect(result.isValid).toBe(false);
      expect(result.context.counter).toBe(1);
    });
  });
});