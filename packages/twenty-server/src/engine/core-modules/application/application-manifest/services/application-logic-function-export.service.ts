import { Injectable } from '@nestjs/common';

import { ApplicationSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-source.service';
import { exportLogicFunctionSources } from 'src/engine/core-modules/application/application-manifest/utils/export-logic-function-sources.util';

@Injectable()
export class ApplicationLogicFunctionExportService {
  constructor(
    private readonly applicationSourceService: ApplicationSourceService,
  ) {}

  exportLogicFunctions(
    options: Omit<
      Parameters<typeof exportLogicFunctionSources>[0],
      'readSource'
    >,
  ) {
    return exportLogicFunctionSources({
      ...options,
      readSource: (request) => this.applicationSourceService.read(request),
    });
  }
}
