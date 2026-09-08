import { Test } from '@nestjs/testing';

import { CheckPendingInstanceCommandCommand } from 'src/database/commands/check-pending-instance-command.command';
import {
  InstanceCommandGenerationService,
  type PendingSchemaChange,
} from 'src/database/commands/instance-command-generation.service';

describe('CheckPendingInstanceCommandCommand', () => {
  const initialExitCode = process.exitCode;

  const buildCommand = async (pendingSchemaChanges: PendingSchemaChange[]) => {
    const module = await Test.createTestingModule({
      providers: [
        CheckPendingInstanceCommandCommand,
        {
          provide: InstanceCommandGenerationService,
          useValue: {
            getPendingSchemaChanges: jest
              .fn()
              .mockResolvedValue(pendingSchemaChanges),
          },
        },
      ],
    }).compile();

    return module.get(CheckPendingInstanceCommandCommand);
  };

  beforeEach(() => {
    process.exitCode = undefined;
  });

  afterAll(() => {
    process.exitCode = initialExitCode;
  });

  it('should succeed when no schema change is pending', async () => {
    const command = await buildCommand([]);

    await command.run();

    expect(process.exitCode).toBeUndefined();
  });

  it('should fail when a schema change is not covered by an instance command', async () => {
    const command = await buildCommand([
      { query: 'ALTER TABLE "core"."user" ADD "foo" character varying' },
    ]);

    await command.run();

    expect(process.exitCode).toBe(1);
  });
});
