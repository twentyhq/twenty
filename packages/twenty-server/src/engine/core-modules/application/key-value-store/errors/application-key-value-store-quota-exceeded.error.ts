import { BadRequestException } from '@nestjs/common';

export class ApplicationKeyValueStoreQuotaExceededError extends BadRequestException {
  constructor(maxSizeInBytes: number) {
    super(
      `Key-value storage quota exceeded. The application key-value store is limited to ${maxSizeInBytes} bytes per workspace.`,
    );
  }
}
