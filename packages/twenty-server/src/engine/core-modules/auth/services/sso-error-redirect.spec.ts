import { Test, TestingModule } from '@nestjs/testing';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

import { SsoErrorRedirectService } from './sso-error-redirect.service';

describe('SsoErrorRedirectService', () => {
  let service: SsoErrorRedirectService;
  let domainManagerService: DomainManagerService;
  let exceptionHandlerService: ExceptionHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SsoErrorRedirectService,
        {
          provide: DomainManagerService,
          useValue: {
            computeRedirectErrorUrl: jest.fn(),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SsoErrorRedirectService>(SsoErrorRedirectService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
    exceptionHandlerService = module.get<ExceptionHandlerService>(
      ExceptionHandlerService,
    );
  });

  it('should handle exceptions and compute redirect URL for generic errors', () => {
    const error = new Error('Generic error');
    const workspace = { id: '123', subdomain: 'example' };

    const captureExceptionsSpy = jest.spyOn(
      exceptionHandlerService,
      'captureExceptions',
    );
    const computeRedirectErrorUrlSpy = jest
      .spyOn(domainManagerService, 'computeRedirectErrorUrl')
      .mockReturnValue('http://example.com/error');

    const result = service.getRedirectErrorUrlAndCaptureExceptions(
      error,
      workspace,
    );

    expect(captureExceptionsSpy).toHaveBeenCalledWith([error], {
      workspace: { id: '123' },
    });
    expect(computeRedirectErrorUrlSpy).toHaveBeenCalledWith(
      'Generic error',
      'example',
    );
    expect(result).toBe('http://example.com/error');
  });

  it('should not capture exceptions for AuthException without INTERNAL_SERVER_ERROR code', () => {
    const error = new AuthException(
      'Auth error',
      AuthExceptionCode.USER_NOT_FOUND,
    );
    const workspace = { id: '123', subdomain: 'example' };

    const captureExceptionsSpy = jest.spyOn(
      exceptionHandlerService,
      'captureExceptions',
    );
    const computeRedirectErrorUrlSpy = jest
      .spyOn(domainManagerService, 'computeRedirectErrorUrl')
      .mockReturnValue('http://example.com/error');

    const result = service.getRedirectErrorUrlAndCaptureExceptions(
      error,
      workspace,
    );

    expect(captureExceptionsSpy).not.toHaveBeenCalled();
    expect(computeRedirectErrorUrlSpy).toHaveBeenCalledWith(
      'Auth error',
      'example',
    );
    expect(result).toBe('http://example.com/error');
  });

  it('should capture exceptions for AuthException with INTERNAL_SERVER_ERROR code', () => {
    const error = new AuthException(
      'Server error',
      AuthExceptionCode.INTERNAL_SERVER_ERROR,
    );
    const workspace = { id: '123', subdomain: 'example' };

    const captureExceptionsSpy = jest.spyOn(
      exceptionHandlerService,
      'captureExceptions',
    );
    const computeRedirectErrorUrlSpy = jest
      .spyOn(domainManagerService, 'computeRedirectErrorUrl')
      .mockReturnValue('http://example.com/error');

    const result = service.getRedirectErrorUrlAndCaptureExceptions(
      error,
      workspace,
    );

    expect(captureExceptionsSpy).toHaveBeenCalledWith([error], {
      workspace: { id: '123' },
    });
    expect(computeRedirectErrorUrlSpy).toHaveBeenCalledWith(
      'Server error',
      'example',
    );
    expect(result).toBe('http://example.com/error');
  });

  it('should return redirect URL with a default error message for errors without a message', () => {
    const error = new Error();
    const workspace = { subdomain: 'example' };

    const computeRedirectErrorUrlSpy = jest
      .spyOn(domainManagerService, 'computeRedirectErrorUrl')
      .mockReturnValue('http://example.com/error');

    const result = service.getRedirectErrorUrlAndCaptureExceptions(
      error,
      workspace,
    );

    expect(computeRedirectErrorUrlSpy).toHaveBeenCalledWith(
      'Unknown error',
      'example',
    );
    expect(result).toBe('http://example.com/error');
  });
});
