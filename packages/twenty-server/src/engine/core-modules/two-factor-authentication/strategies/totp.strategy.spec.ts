import { Logger } from '@nestjs/common';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from '../two-factor-authentication.exception';
import { TotpStrategy, TOTPStrategyConfig } from './totp.strategy';
import { OTPHashAlgorithms, OTPKeyEncodings, TotpContext } from '../two-factor-authentication.interface';
import { totp } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

describe('TOTPStrategy Configuration', () => {
  let warnSpy: jest.SpyInstance;

  const validOptions: TOTPStrategyConfig = {
    algorithm: OTPHashAlgorithms.SHA256,
    digits: 8,
    encodings: OTPKeyEncodings.HEX,
    window: 5,
    step: 30
  };

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  describe('Valid Configurations', () => {
    it('should instantiate with default options when none are provided', () => {
      expect(() => new TotpStrategy()).not.toThrow();
    });

    it('should instantiate with all valid custom options', () => {
      expect(() => new TotpStrategy(validOptions)).not.toThrow();
    });

    it('should warn when all custom options are valid but not recommended', () => {
      const authenticatorIncompatibleOptions = {
        ...validOptions,
        algorithm: OTPHashAlgorithms.SHA256,
        encodings: OTPKeyEncodings.BASE64,
      };
      
      expect(
          () => new TotpStrategy(authenticatorIncompatibleOptions)
      ).not.toThrow();

      expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('should correctly set the window property', () => {
      const strategy = new TotpStrategy({ window: 10 });
      expect((strategy as any).totp.allOptions().window).toBe(10);
    });

    it('should default window to 0 if not provided', () => {
      const strategy = new TotpStrategy();
      expect((strategy as any).totp.allOptions().window).toBe(0);
    });
  });

  describe('Invalid Configurations (Error Handling)', () => {
    it('should throw TwoFactorAuthenticationException for an invalid algorithm', () => {
      const invalidOptions: TOTPStrategyConfig = { 
          digits: 5,
          algorithm: 'MD5' as OTPHashAlgorithms,
          encodings: 'utf-8' as OTPKeyEncodings,
          window: -1,
          step: '' as unknown as number
      };

      expect.assertions(7);

      try {
        new TotpStrategy(invalidOptions)
      } catch (e) {
        expect(e).toBeInstanceOf(TwoFactorAuthenticationException);
        expect(e.code).toEqual(TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION)
        expect(e.message).toContain('digits')
        expect(e.message).toContain('algorithm')
        expect(e.message).toContain('encodings')
        expect(e.message).toContain('window')
        expect(e.message).toContain('step')
      }
    });
  });

  describe('initiate', () => {
    it('should return a valid URI and context object', () => {
      const strategy = new TotpStrategy();
      const accountName = 'test@example.com';
      const issuer = 'MyAwesomeApp';
  
      const result = strategy.initiate(accountName, issuer);
  
      expect(result.uri).toContain(`otpauth://totp/${issuer}:${encodeURIComponent(accountName)}`);
      expect(result.uri).toContain(`?secret=${result.context.secret}`);
      expect(result.uri).toContain(`&issuer=${issuer}`);
      expect(result.uri).toContain(`&period=30`);
  
      expect(result.context).toEqual({
        strategy: 'TOTP',
        status: 'PENDING',
        secret: expect.any(String),
      });
    });
  });

  describe('validate', () => {
    let strategy: TotpStrategy;
    const secret = 'KVKFKRCPNZQUYMLXOVYDSKJK';
    const RESYNCH_WINDOW = 3;
    let context: TotpContext;
  
    beforeEach(() => {
      strategy = new TotpStrategy({ 
        window: RESYNCH_WINDOW 
      });

      context = {
        strategy: TwoFactorAuthenticationStrategy.TOTP,
        status: 'VERIFIED' as const,
        secret,
      };
    });
  
    it('should return true for a valid token at the current counter', () => {
      const token = totp.generate(secret);
      const result = strategy.validate(
        token,
        context
      );
  
      expect(result.isValid).toBe(true);
    });
  
    it('should return false for an invalid token', () => {
      const token = '000000';
      const result = strategy.validate(
        token,
        context
      );
  
      expect(result.isValid).toBe(false);
    });
  
    it('should succeed if the token is valid within the window', () => {
      const futureTokenStrategy = new TotpStrategy({ 
        epoch: Date.now() + (validOptions.step! * RESYNCH_WINDOW * 1000),
      }); 
      const futureToken = (futureTokenStrategy as any).totp.generate(secret); 

      const result = strategy.validate(
        futureToken,
        context
      );

      expect(result.isValid).toBe(true);
    });

    it('should fail if the token is valid but outside the window', () => {
      const futureTokenStrategy = new TotpStrategy({ 
        epoch: Date.now() + (validOptions.step! * (RESYNCH_WINDOW + 10) * 1000),
      }); 
      const futureToken = (futureTokenStrategy as any).totp.generate(secret); 

      const result = strategy.validate(
        futureToken,
        context
      );

      expect(result.isValid).toBe(false);
    });
  });
});