/* @license Enterprise */

import { ENTERPRISE_DEV_VALIDITY_TOKEN } from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import { verifyEnterpriseJwt } from 'src/engine/core-modules/enterprise/utils/verify-enterprise-jwt.util';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

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
    it.each([
      { generation: 'previous', token: PREVIOUS_DEV_VALIDITY_TOKEN },
      { generation: 'current', token: ENTERPRISE_DEV_VALIDITY_TOKEN },
    ])(
      '$generation development token has the expected trust boundary',
      ({ token }) => {
        const payload = verifyEnterpriseJwt({ token, nodeEnvironment });

        if (acceptsDevelopmentTokens) {
          expect(payload).toEqual({
            sub: 'dev-subscription-id',
            status: 'valid',
            iat: 1773308833,
            exp: 4897511233,
          });
        } else {
          expect(payload).toBeNull();
        }
      },
    );
  },
);
