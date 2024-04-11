import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

export class AppTokenService extends TypeOrmQueryService<AppToken> {}
