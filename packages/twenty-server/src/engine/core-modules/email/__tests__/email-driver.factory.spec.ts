import { Test, type TestingModule } from '@nestjs/testing';

import { EmailDriverFactory } from 'src/engine/core-modules/email/email-driver.factory';
import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('EmailDriverFactory', () => {
  let factory: EmailDriverFactory;
  let twentyConfigService: TwentyConfigService;

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailDriverFactory,
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
      ],
    }).compile();

    factory = module.get<EmailDriverFactory>(EmailDriverFactory);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);

    jest.clearAllMocks();
  });

  describe('buildConfigKey', () => {
    it('should return "logger" for logger driver', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.LOGGER);

      const result = factory['buildConfigKey']();

      expect(result).toBe('logger');
      expect(twentyConfigService.get).toHaveBeenCalledWith('EMAIL_DRIVER');
    });

    it('should return smtp config key for smtp driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(EmailDriver.SMTP);
      jest
        .spyOn(factory as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      const result = factory['buildConfigKey']();

      expect(result).toBe('smtp|smtp-hash-123');
      expect(twentyConfigService.get).toHaveBeenCalledWith('EMAIL_DRIVER');
    });

    it('should throw error for unsupported driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => factory['buildConfigKey']()).toThrow(
        'Unsupported email driver: invalid-driver',
      );
    });
  });

  describe('createDriver', () => {
    it('should create logger driver', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.LOGGER);

      const driver = factory['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LoggerDriver');
    });

    it('should create smtp driver with basic configuration', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.SMTP;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            case 'EMAIL_SMTP_USER':
              return undefined;
            case 'EMAIL_SMTP_PASSWORD':
              return undefined;
            case 'EMAIL_SMTP_NO_TLS':
              return false;
            default:
              return undefined;
          }
        });

      const driver = factory['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should throw error when smtp host is missing', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.SMTP;
            case 'EMAIL_SMTP_HOST':
              return undefined;
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });

      expect(() => factory['createDriver']()).toThrow(
        'SMTP driver requires host and port to be defined',
      );
    });

    it('should throw error for invalid driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => factory['createDriver']()).toThrow(
        'Invalid email driver: invalid-driver',
      );
    });
  });

  describe('getCurrentDriver', () => {
    it('should return current driver for logger', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.LOGGER);

      const driver = factory.getCurrentDriver();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LoggerDriver');
    });

    it('should reuse driver when config key unchanged', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.LOGGER);

      const driver1 = factory.getCurrentDriver();
      const driver2 = factory.getCurrentDriver();

      expect(driver1).toBe(driver2);
    });

    it('should create new driver when config key changes', () => {
      // First call with logger
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.LOGGER);

      const driver1 = factory.getCurrentDriver();

      // Second call with smtp
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.SMTP;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });
      jest
        .spyOn(factory as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      const driver2 = factory.getCurrentDriver();

      expect(driver1).not.toBe(driver2);
      expect(driver1.constructor.name).toBe('LoggerDriver');
      expect(driver2.constructor.name).toBe('SmtpDriver');
    });

    it('should throw error for unsupported email driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => factory.getCurrentDriver()).toThrow(
        'Failed to build config key for EmailDriverFactory. Original error: Unsupported email driver: invalid-driver',
      );
    });

    it('should throw error when driver creation fails after valid config', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.SMTP;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });

      jest
        .spyOn(factory as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      jest.spyOn(factory as any, 'createDriver').mockImplementation(() => {
        throw new Error('Driver creation failed');
      });

      expect(() => factory.getCurrentDriver()).toThrow(
        'Failed to create driver for EmailDriverFactory with config key: smtp|smtp-hash-123. Original error: Driver creation failed',
      );
    });
  });
});
