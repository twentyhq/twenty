import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { CustomCodeEngineService } from 'src/engine/integrations/custom-code-engine/custom-code-engine.service';
import {
  FunctionMetadataEntity,
  FunctionSyncStatus,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

@Injectable()
export class FunctionService {
  constructor(
    private readonly customCodeEngineService: CustomCodeEngineService,
    @InjectRepository(FunctionMetadataEntity, 'metadata')
    private readonly functionMetadataRepository: Repository<FunctionMetadataEntity>,
  ) {}

  async executeFunction(name: string, payload: object | undefined = undefined) {
    const functionToExecute =
      await this.functionMetadataRepository.findOneOrFail({
        where: {
          name,
        },
      });

    return this.customCodeEngineService.execute(functionToExecute, payload);
  }

  async upsertFunction(workspaceId: string, file: FileUpload, name: string) {
    const { sourceCodePath, buildSourcePath } =
      await this.customCodeEngineService.generateExecutable(
        name,
        workspaceId,
        file,
      );

    await this.functionMetadataRepository.upsert(
      {
        name,
        workspaceId,
        sourceCodePath,
        buildSourcePath,
        syncStatus: FunctionSyncStatus.READY,
      },
      ['workspaceId', 'name'],
    );

    return sourceCodePath;
  }
}
