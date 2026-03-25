import { Test, type TestingModule } from '@nestjs/testing';

import { type SendMailOptions } from 'nodemailer';

import { EmailDriverFactory } from 'src/engine/core-modules/email/email-driver.factory';
import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';

describe('EmailSenderService', () => {
  let service: EmailSenderService;
  let emailDriverFactory: EmailDriverFactory;

  const mockEmailDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        {
          provide: EmailDriverFactory,
          useValue: mockEmailDriverFactory,
        },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
    emailDriverFactory = module.get<EmailDriverFactory>(EmailDriverFactory);

    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should delegate to the current driver', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      mockEmailDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);

      const sendMailOptions: SendMailOptions = {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message',
      };

      await service.send(sendMailOptions);

      expect(emailDriverFactory.getCurrentDriver).toHaveBeenCalled();
      expect(mockDriver.send).toHaveBeenCalledWith(sendMailOptions);
    });

    it('should handle driver errors', async () => {
      const mockDriver = {
        send: jest.fn().mockRejectedValue(new Error('Driver error')),
      };

      mockEmailDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);

      const sendMailOptions: SendMailOptions = {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message',
      };

      await expect(service.send(sendMailOptions)).rejects.toThrow(
        'Driver error',
      );
      expect(emailDriverFactory.getCurrentDriver).toHaveBeenCalled();
      expect(mockDriver.send).toHaveBeenCalledWith(sendMailOptions);
    });
  });
});
