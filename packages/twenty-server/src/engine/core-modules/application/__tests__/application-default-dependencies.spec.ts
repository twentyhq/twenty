import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import { WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/workspace-custom-application-dependencies-directory-name';

describe('application default dependency rebuild', () => {
  it.each<[string, string | undefined]>([
    [
      'workspace-custom',
      WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    ],
    ['standard', undefined],
    ['installed', undefined],
  ])('rebuilds %s with its own defaults', async (applicationId, directory) => {
    const module = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              workspaceCustomApplicationId: 'workspace-custom',
            }),
          },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    const service = module.get(ApplicationService);
    const upload = jest
      .spyOn(service, 'uploadPackageFilesAndSetFileIds')
      .mockResolvedValue();
    const application = {
      id: applicationId,
      universalIdentifier: applicationId,
      workspaceId: 'workspace',
    };
    const expected = await getDefaultApplicationPackageFields({ directory });

    await service.uploadDefaultPackageFilesAndSetFileIds(application);

    expect(upload).toHaveBeenCalledWith({
      application,
      packageJsonContent: expected.packageJsonContent,
      yarnLockContent: expected.yarnLockContent,
      queryRunner: undefined,
    });
    await module.close();
  });
});
