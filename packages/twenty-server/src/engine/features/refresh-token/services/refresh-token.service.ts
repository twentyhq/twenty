import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { RefreshToken } from 'src/engine/features/refresh-token/refresh-token.entity';

export class RefreshTokenService extends TypeOrmQueryService<RefreshToken> {}
