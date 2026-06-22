import { type Repository } from 'typeorm';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('ApplicationRegistrationService', () => {
  describe('findManyListed', () => {
    it('filters out registrations without an owner workspace', async () => {
      const find = jest.fn().mockResolvedValue([]);
      const repository = { find } as unknown as Repository<ApplicationRegistrationEntity>;

      const service = new ApplicationRegistrationService(
        repository,
        {} as unknown as Repository<ApplicationEntity>,
        {} as unknown as Repository<WorkspaceEntity>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );

      await service.findManyListed();

      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isListed: true,
            sourceType: ApplicationRegistrationSourceType.NPM,
            ownerWorkspaceId: expect.anything(),
          }),
        }),
      );
      const [callArgs] = find.mock.calls[0];

      expect(callArgs.where.ownerWorkspaceId).toBeDefined();
    });
  });
});
