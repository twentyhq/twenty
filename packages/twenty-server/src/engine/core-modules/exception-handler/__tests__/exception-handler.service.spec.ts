import { Test, type TestingModule } from '@nestjs/testing';

import { EXCEPTION_HANDLER_DRIVER } from 'src/engine/core-modules/exception-handler/exception-handler.constants';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

describe('ExceptionHandlerService', () => {
  let service: ExceptionHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionHandlerService,
        {
          provide: EXCEPTION_HANDLER_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExceptionHandlerService>(ExceptionHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
