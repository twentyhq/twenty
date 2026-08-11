import { type DataSource, type QueryRunner } from 'typeorm';

import { EncryptEmptyApplicationVariablesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-instance-command-slow-1786459992777-encrypt-empty-application-variables';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

type ApplicationVariableRow = { id: string; value: string; workspaceId: string };

type RegistrationVariableRow = { id: string; encryptedValue: string };

const buildFakeDataSource = ({
  applicationVariableRows = [],
  registrationVariableRows = [],
}: {
  applicationVariableRows?: ApplicationVariableRow[];
  registrationVariableRows?: RegistrationVariableRow[];
} = {}) => {
  const sortedApplicationVariableRows = [...applicationVariableRows].sort(
    (a, b) => a.id.localeCompare(b.id),
  );
  const sortedRegistrationVariableRows = [...registrationVariableRows].sort(
    (a, b) => a.id.localeCompare(b.id),
  );

  const query = jest.fn(async (sql: string, params: unknown[] = []) => {
    const isApplicationVariableTable = sql.includes(
      '"core"."applicationVariable"',
    );

    if (sql.trimStart().startsWith('SELECT')) {
      const [cursor, limit] = params as [string, number];

      if (isApplicationVariableTable) {
        return sortedApplicationVariableRows
          .filter((row) => row.id > cursor && row.value === '')
          .slice(0, limit)
          .map(({ id, workspaceId }) => ({ id, workspaceId }));
      }

      return sortedRegistrationVariableRows
        .filter((row) => row.id > cursor && row.encryptedValue === '')
        .slice(0, limit)
        .map(({ id }) => ({ id }));
    }

    const [ids, encryptedValues] = params as [string[], string[]];
    let encryptedCount = 0;

    ids.forEach((id, index) => {
      if (isApplicationVariableTable) {
        const target = sortedApplicationVariableRows.find(
          (row) => row.id === id,
        );

        if (target?.value === '') {
          target.value = encryptedValues[index];
          encryptedCount++;
        }

        return;
      }

      const target = sortedRegistrationVariableRows.find(
        (row) => row.id === id,
      );

      if (target?.encryptedValue === '') {
        target.encryptedValue = encryptedValues[index];
        encryptedCount++;
      }
    });

    return [{ count: String(encryptedCount) }];
  });

  return {
    dataSource: { query } as unknown as DataSource,
    query,
    applicationVariableRows: sortedApplicationVariableRows,
    registrationVariableRows: sortedRegistrationVariableRows,
  };
};

const buildCommand = () => {
  const secretEncryptionService = {
    encryptVersioned: jest.fn(
      (value: string, opts?: { workspaceId?: string }) =>
        `enc:v2:deadbeef:${value}|${opts?.workspaceId ?? 'instance'}`,
    ),
  } as unknown as SecretEncryptionService;

  return new EncryptEmptyApplicationVariablesSlowInstanceCommand(
    secretEncryptionService,
  );
};

const updateCallCount = (query: jest.Mock): number =>
  query.mock.calls.filter(([sql]: [string]) =>
    !sql.trimStart().startsWith('SELECT'),
  ).length;

describe('EncryptEmptyApplicationVariablesSlowInstanceCommand', () => {
  describe('registration', () => {
    it('is registered against 2.31.0 as a slow command', () => {
      const metadata = getRegisteredInstanceCommandMetadata(
        EncryptEmptyApplicationVariablesSlowInstanceCommand,
      );

      expect(metadata).toEqual({
        version: '2.31.0',
        timestamp: 1786459992777,
        type: 'slow',
      });
    });
  });

  describe('runDataMigration', () => {
    it('should encrypt empty values in both tables with their own encryption scope', async () => {
      const fake = buildFakeDataSource({
        applicationVariableRows: [
          { id: 'a', value: '', workspaceId: 'workspace-1' },
          {
            id: 'b',
            value: 'enc:v2:deadbeef:kept|workspace-1',
            workspaceId: 'workspace-1',
          },
        ],
        registrationVariableRows: [{ id: 'r', encryptedValue: '' }],
      });

      await buildCommand().runDataMigration(fake.dataSource);

      expect(fake.applicationVariableRows).toEqual([
        { id: 'a', value: 'enc:v2:deadbeef:|workspace-1', workspaceId: 'workspace-1' },
        {
          id: 'b',
          value: 'enc:v2:deadbeef:kept|workspace-1',
          workspaceId: 'workspace-1',
        },
      ]);
      expect(fake.registrationVariableRows).toEqual([
        { id: 'r', encryptedValue: 'enc:v2:deadbeef:|instance' },
      ]);
    });

    it('should issue no updates on a second run', async () => {
      const fake = buildFakeDataSource({
        applicationVariableRows: [
          { id: 'a', value: '', workspaceId: 'workspace-1' },
        ],
        registrationVariableRows: [{ id: 'r', encryptedValue: '' }],
      });
      const command = buildCommand();

      await command.runDataMigration(fake.dataSource);

      const updateCallCountAfterFirstRun = updateCallCount(fake.query);

      await command.runDataMigration(fake.dataSource);

      expect(updateCallCount(fake.query)).toBe(updateCallCountAfterFirstRun);
    });
  });

  describe('up', () => {
    it('tightens both constraints and drops the empty-string defaults', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await buildCommand().up(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_value_encrypted"',
        'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_value_encrypted" CHECK ("value" LIKE \'enc:v2:%\')',
        'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" DROP DEFAULT',
        'ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_encryptedValue_encrypted"',
        'ALTER TABLE "core"."applicationRegistrationVariable" ADD CONSTRAINT "CHK_applicationRegistrationVariable_encryptedValue_encrypted" CHECK ("encryptedValue" LIKE \'enc:v2:%\')',
        'ALTER TABLE "core"."applicationRegistrationVariable" ALTER COLUMN "encryptedValue" DROP DEFAULT',
      ]);
    });
  });

  describe('down', () => {
    it('restores the defaults and the loose constraints in reverse order', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await buildCommand().down(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."applicationRegistrationVariable" ALTER COLUMN "encryptedValue" SET DEFAULT \'\'',
        'ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_encryptedValue_encrypted"',
        'ALTER TABLE "core"."applicationRegistrationVariable" ADD CONSTRAINT "CHK_applicationRegistrationVariable_encryptedValue_encrypted" CHECK ("encryptedValue" = \'\' OR "encryptedValue" LIKE \'enc:v2:%\')',
        'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" SET DEFAULT \'\'',
        'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_value_encrypted"',
        'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_value_encrypted" CHECK ("value" = \'\' OR "value" LIKE \'enc:v2:%\')',
      ]);
    });
  });
});
