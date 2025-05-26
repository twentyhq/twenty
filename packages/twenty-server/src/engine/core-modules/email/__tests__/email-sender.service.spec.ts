import { Test, TestingModule } from '@nestjs/testing';

import { SendMailOptions } from 'nodemailer';

import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';
import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('EmailSenderService', () => {
  let service: EmailSenderService;
  let twentyConfigService: TwentyConfigService;

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);

    jest.clearAllMocks();
  });

  describe('buildConfigKey', () => {
    it('should return "logger" for logger driver', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const result = service['buildConfigKey']();

      expect(result).toBe('logger');
      expect(twentyConfigService.get).toHaveBeenCalledWith('EMAIL_DRIVER');
    });

    it('should return smtp config key for smtp driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(EmailDriver.Smtp);
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      const result = service['buildConfigKey']();

      expect(result).toBe('smtp|smtp-hash-123');
      expect(twentyConfigService.get).toHaveBeenCalledWith('EMAIL_DRIVER');
    });

    it('should throw error for unsupported driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => service['buildConfigKey']()).toThrow(
        'Unsupported email driver: invalid-driver',
      );
    });
  });

  describe('createDriver', () => {
    it('should create logger driver', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LoggerDriver');
    });

    it('should create smtp driver with basic configuration', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
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

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should create smtp driver with authentication', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            case 'EMAIL_SMTP_USER':
              return 'user@example.com';
            case 'EMAIL_SMTP_PASSWORD':
              return 'password123';
            case 'EMAIL_SMTP_NO_TLS':
              return false;
            default:
              return undefined;
          }
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should create smtp driver with no TLS configuration', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 25;
            case 'EMAIL_SMTP_USER':
              return 'user@example.com';
            case 'EMAIL_SMTP_PASSWORD':
              return 'password123';
            case 'EMAIL_SMTP_NO_TLS':
              return true;
            default:
              return undefined;
          }
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should create smtp driver with port 465 (secure)', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 465;
            case 'EMAIL_SMTP_USER':
              return 'user@example.com';
            case 'EMAIL_SMTP_PASSWORD':
              return 'password123';
            case 'EMAIL_SMTP_NO_TLS':
              return false;
            default:
              return undefined;
          }
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should throw error when smtp host is missing', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return undefined;
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });

      expect(() => service['createDriver']()).toThrow(
        'SMTP driver requires host and port to be defined',
      );
    });

    it('should throw error when smtp port is missing', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return undefined;
            default:
              return undefined;
          }
        });

      expect(() => service['createDriver']()).toThrow(
        'SMTP driver requires host and port to be defined',
      );
    });

    it('should throw error for invalid driver', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => service['createDriver']()).toThrow(
        'Invalid email driver: invalid-driver',
      );
    });
  });

  describe('send', () => {
    const mockSendMailOptions: SendMailOptions = {
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Test message',
    };

    it('should send email using logger driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const mockDriver = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .spyOn(service as any, 'getCurrentDriver')
        .mockReturnValue(mockDriver);

      await service.send(mockSendMailOptions);

      expect(mockDriver.send).toHaveBeenCalledWith(mockSendMailOptions);
    });

    it('should send email using smtp driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });

      const mockDriver = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .spyOn(service as any, 'getCurrentDriver')
        .mockReturnValue(mockDriver);

      await service.send(mockSendMailOptions);

      expect(mockDriver.send).toHaveBeenCalledWith(mockSendMailOptions);
    });

    it('should handle send errors', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const mockDriver = {
        send: jest.fn().mockRejectedValue(new Error('Send failed')),
      };

      jest
        .spyOn(service as any, 'getCurrentDriver')
        .mockReturnValue(mockDriver);

      await expect(service.send(mockSendMailOptions)).rejects.toThrow(
        'Send failed',
      );
    });
  });

  describe('getCurrentDriver', () => {
    it('should return current driver for logger', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const driver = service['getCurrentDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LoggerDriver');
    });

    it('should return current driver for smtp', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      const driver = service['getCurrentDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('SmtpDriver');
    });

    it('should reuse driver when config key unchanged', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const driver1 = service['getCurrentDriver']();
      const driver2 = service['getCurrentDriver']();

      expect(driver1).toBe(driver2);
    });

    it('should create new driver when config key changes', () => {
      // First call with logger
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const driver1 = service['getCurrentDriver']();

      // Second call with smtp
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      const driver2 = service['getCurrentDriver']();

      expect(driver1).not.toBe(driver2);
      expect(driver1.constructor.name).toBe('LoggerDriver');
      expect(driver2.constructor.name).toBe('SmtpDriver');
    });

    it('should throw error if driver creation fails', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-driver');

      expect(() => service['getCurrentDriver']()).toThrow(
        'Unsupported email driver: invalid-driver',
      );
    });

    it('should throw error if createDriver fails after validation', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            default:
              return undefined;
          }
        });
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      jest.spyOn(service as any, 'createDriver').mockImplementation(() => {
        throw new Error('Driver creation failed');
      });

      expect(() => service['getCurrentDriver']()).toThrow(
        'Failed to create driver for EmailSenderService with config key: smtp|smtp-hash-123. Original error: Driver creation failed',
      );
    });
  });

  describe('integration tests', () => {
    it('should handle complete email sending flow with logger driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(EmailDriver.Logger);

      const sendMailOptions: SendMailOptions = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Integration Test',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      };

      // Should not throw
      await expect(service.send(sendMailOptions)).resolves.not.toThrow();
    });

    it('should handle complete email sending flow with smtp driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'EMAIL_DRIVER':
              return EmailDriver.Smtp;
            case 'EMAIL_SMTP_HOST':
              return 'smtp.example.com';
            case 'EMAIL_SMTP_PORT':
              return 587;
            case 'EMAIL_SMTP_USER':
              return 'user@example.com';
            case 'EMAIL_SMTP_PASSWORD':
              return 'password123';
            case 'EMAIL_SMTP_NO_TLS':
              return false;
            default:
              return undefined;
          }
        });
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('smtp-hash-123');

      // Mock the actual SMTP send to avoid real network calls
      const mockSmtpSend = jest.fn().mockResolvedValue(undefined);

      jest.spyOn(service as any, 'createDriver').mockReturnValue({
        send: mockSmtpSend,
      });

      const sendMailOptions: SendMailOptions = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Integration Test',
        text: 'This is a test email',
      };

      await service.send(sendMailOptions);

      expect(mockSmtpSend).toHaveBeenCalledWith(sendMailOptions);
    });
  });
});
