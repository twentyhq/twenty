import { type ApplicationTransferService } from 'src/database/commands/application-transfer/services/application-transfer.service';
import { TransferApplicationToWorkspaceCustomApplicationCommand } from 'src/database/commands/application-transfer/transfer-application-to-workspace-custom-application.command';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const APPLICATION_UNIVERSAL_IDENTIFIER = '7a1b6a4c-1111-4c3e-9a3f-000000000001';

describe('TransferApplicationToWorkspaceCustomApplicationCommand', () => {
  const transferToWorkspaceCustomApplicationOrThrow = jest
    .fn()
    .mockResolvedValue({ blockers: [] });
  const command = new TransferApplicationToWorkspaceCustomApplicationCommand({
    transferToWorkspaceCustomApplicationOrThrow,
  } as unknown as ApplicationTransferService);

  beforeEach(() => {
    transferToWorkspaceCustomApplicationOrThrow.mockClear();
  });

  it('should reject identifiers that are not UUIDs', () => {
    expect(() => command.parseWorkspaceId('twenty-internal')).toThrow(
      'is not a valid UUID',
    );
    expect(() =>
      command.parseApplicationUniversalIdentifier('twenty-for-twenty'),
    ).toThrow('is not a valid UUID');
    expect(command.parseWorkspaceId(WORKSPACE_ID)).toBe(WORKSPACE_ID);
  });

  it('should run a real transfer without adopting the role or deleting the registration by default', async () => {
    await command.run([], {
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(transferToWorkspaceCustomApplicationOrThrow).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      isDryRun: false,
      shouldAdoptDefaultRole: false,
      shouldDeleteRegistration: false,
    });
  });

  it('should forward the opt-in flags', async () => {
    await command.run([], {
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      dryRun: command.parseDryRun(),
      adoptDefaultRole: command.parseAdoptDefaultRole(),
      deleteRegistration: command.parseDeleteRegistration(),
    });

    expect(transferToWorkspaceCustomApplicationOrThrow).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      isDryRun: true,
      shouldAdoptDefaultRole: true,
      shouldDeleteRegistration: true,
    });
  });
});
