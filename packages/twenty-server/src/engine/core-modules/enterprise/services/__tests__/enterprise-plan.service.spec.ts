/* @license Enterprise */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ENTERPRISE_DEV_VALIDITY_TOKEN } from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const PREVIOUS_DEV_VALIDITY_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtc3Vic2NyaXB0aW9uLWlkIiwic3RhdHVzIjoidmFsaWQiLCJpYXQiOjE3NzMzMDg4MzMsImV4cCI6NDg5NzUxMTIzM30.qhfrW_SV2Y86fWtWXsALlAVhxmMxylUUIefN0fki10Q2NTGGqFVXZrNn2WacJY37yq3m5y4WgwZw34ua6E0ff_YUXsrlY5OHJWHT9DMqKCRn-JujHJnnYp3VHLncy5CvxH5r9mfPFp-5AWe1pYeR1T63sTiejH3sfDrNE357SB7KVti8LCcnsJxEtXB2tRnvyvdun7A-GKoKYEIam-16ZRKKFs6GaWo8ObHdfm8yBt6uK4DZSGPWb644QyWh9FtDxbzJ0ti54DuHSlErLgIp1NNEsMA0MK7zFY7StRaOdt72rxE1ZHwN7e6HhweTU4ORVUPfYkjDFLB2fF7Pa7Kvdg';

describe.each([
  {
    nodeEnvironment: NodeEnvironment.DEVELOPMENT,
    acceptsDevelopmentTokens: true,
  },
  { nodeEnvironment: NodeEnvironment.TEST, acceptsDevelopmentTokens: true },
  {
    nodeEnvironment: NodeEnvironment.PRODUCTION,
    acceptsDevelopmentTokens: false,
  },
])(
  'enterprise license verification in $nodeEnvironment',
  ({ nodeEnvironment, acceptsDevelopmentTokens }) => {
    let service: EnterprisePlanService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
          EnterprisePlanService,
          {
            provide: TwentyConfigService,
            useValue: { get: jest.fn().mockReturnValue(nodeEnvironment) },
          },
          ...[
            AppTokenEntity,
            UserWorkspaceEntity,
            UserEntity,
            WorkspaceEntity,
          ].map((entity) => ({
            provide: getRepositoryToken(entity),
            useValue: {},
          })),
        ],
      }).compile();

      service = module.get(EnterprisePlanService);
    });

    it.each([
      { generation: 'previous', token: PREVIOUS_DEV_VALIDITY_TOKEN },
      { generation: 'current', token: ENTERPRISE_DEV_VALIDITY_TOKEN },
    ])(
      '$generation development token has the expected trust boundary',
      ({ token }) => {
        expect(service.isValidEnterpriseKeyFormat(token)).toBe(
          acceptsDevelopmentTokens,
        );
      },
    );
  },
);
