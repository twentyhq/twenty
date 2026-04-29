import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type Request as ExpressRequest } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwksClient, passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type PartialUserWithPicture } from 'src/engine/core-modules/auth/types/signInUp.type';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SUPABASE_COOKIE_VALUE_BASE64_PREFIX = 'base64-';
const supabaseCookieLogger = new Logger('SupabaseJwtAuthStrategy');

type SupabaseJwtPayload = {
  sub: string;
  email?: string;
  iss?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

@Injectable()
export class SupabaseJwtAuthStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  private readonly supabase: SupabaseClient;
  private readonly issuer: string;
  public readonly cookieName: string;
  private readonly jwksClient: JwksClient;
  private readonly logger = new Logger(SupabaseJwtAuthStrategy.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly signInUpService: SignInUpService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {
    const jwksUri = process.env.SUPABASE_JWKS_URI?.trim();
    const issuer = process.env.SUPABASE_JWT_ISSUER?.trim();
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim();

    if (!jwksUri || !issuer || !supabaseUrl || !serviceKey) {
      throw new Error(
        'Supabase env vars missing: SUPABASE_JWKS_URI, SUPABASE_JWT_ISSUER, SUPABASE_URL, SUPABASE_SERVICE_KEY are all required',
      );
    }

    const projectRef = SupabaseJwtAuthStrategy.deriveProjectRef(supabaseUrl);
    const cookieName = `sb-${projectRef}-auth-token`;

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: ExpressRequest) =>
          SupabaseJwtAuthStrategy.extractAccessTokenFromCookie(req, cookieName),
      ]),
      ignoreExpiration: false,
      algorithms: ['ES256', 'HS256'],
      issuer,
      secretOrKeyProvider: passportJwtSecret({
        jwksUri,
        cache: true,
        rateLimit: true,
      }),
    };

    super(options);

    this.issuer = issuer;
    this.cookieName = cookieName;
    this.jwksClient = new JwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
    });
    this.supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async verifyAndExtractContext(rawJwt: string): Promise<AuthContext> {
    this.logger.log(`verifyAndExtractContext: starting`);
    try {
      const verifiedPayload = await new Promise<SupabaseJwtPayload>(
        (resolve, reject) => {
          jwt.verify(
            rawJwt,
            (header, callback) => {
              if (!header.kid) {
                callback(new Error('Supabase JWT is missing kid header'));

                return;
              }

              this.jwksClient
                .getSigningKey(header.kid)
                .then((key) => callback(null, key.getPublicKey()))
                .catch((error: Error) => callback(error));
            },
            {
              algorithms: ['ES256', 'HS256'],
              issuer: this.issuer,
              ignoreExpiration: false,
            },
            (error, decoded) => {
              if (error) {
                reject(error);

                return;
              }

              if (!decoded || typeof decoded === 'string') {
                reject(
                  new Error('Supabase JWT could not be decoded as object'),
                );

                return;
              }

              resolve(decoded as SupabaseJwtPayload);
            },
          );
        },
      );

      return await this.validate(verifiedPayload);
    } catch (error) {
      const err = error as Error;

      this.logger.error(
        `verifyAndExtractContext FAILED: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  private static deriveProjectRef(supabaseUrl: string): string {
    let hostname: string;

    try {
      hostname = new URL(supabaseUrl).hostname;
    } catch {
      throw new Error(
        `SUPABASE_URL is not a valid URL: ${JSON.stringify(supabaseUrl)}`,
      );
    }

    const projectRef = hostname.split('.')[0];

    if (!projectRef) {
      throw new Error(
        `Could not derive Supabase project ref from URL: ${supabaseUrl}`,
      );
    }

    return projectRef;
  }

  private static readRawCookie(
    req: ExpressRequest,
    name: string,
  ): string | null {
    const fromParser = (req as { cookies?: Record<string, string> }).cookies?.[
      name
    ];

    if (typeof fromParser === 'string' && fromParser.length > 0) {
      return fromParser;
    }

    const cookieHeader = req.headers?.cookie;

    if (typeof cookieHeader !== 'string') return null;

    for (const part of cookieHeader.split(';')) {
      const [rawName, ...rest] = part.split('=');

      if (rawName?.trim() === name) {
        return decodeURIComponent(rest.join('=').trim());
      }
    }

    return null;
  }

  static extractAccessTokenFromCookie(
    req: ExpressRequest,
    cookieName: string,
  ): string | null {
    const raw = SupabaseJwtAuthStrategy.readRawCookie(req, cookieName);

    if (raw === null) return null;

    try {
      const base64 = raw.startsWith(SUPABASE_COOKIE_VALUE_BASE64_PREFIX)
        ? raw.slice(SUPABASE_COOKIE_VALUE_BASE64_PREFIX.length)
        : raw;
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      const parsed = JSON.parse(json) as { access_token?: unknown };

      if (typeof parsed.access_token !== 'string' || !parsed.access_token) {
        supabaseCookieLogger.warn(
          `Supabase cookie ${cookieName} did not contain an access_token`,
        );

        return null;
      }

      return parsed.access_token;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      supabaseCookieLogger.warn(
        `Failed to decode Supabase cookie ${cookieName}: ${message}`,
      );

      return null;
    }
  }

  async validate(payload: SupabaseJwtPayload): Promise<AuthContext> {
    this.logger.log(
      `validate: payload sub=${payload.sub} email=${payload.email}`,
    );
    try {
      if (payload.iss !== this.issuer) {
        throw new UnauthorizedException('Invalid token issuer');
      }

      if (!payload.email || !payload.sub) {
        throw new UnauthorizedException('Token is missing email or sub');
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('company_id')
        .eq('id', payload.sub)
        .maybeSingle();

      if (profileError) {
        throw new UnauthorizedException(
          `Failed to load W144 profile: ${profileError.message}`,
        );
      }

      if (!profile?.company_id) {
        throw new UnauthorizedException('User has no W144 company');
      }
      this.logger.debug(
        `validate: profile lookup OK, company_id=${profile.company_id}`,
      );

      const { data: connection, error: connectionError } = await this.supabase
        .from('hub_connections')
        .select('workspace_id, status')
        .eq('company_id', profile.company_id)
        .eq('hub_type', 'crm')
        .eq('status', 'connected')
        .maybeSingle();

      if (connectionError) {
        throw new UnauthorizedException(
          `Failed to load CRM Hub connection: ${connectionError.message}`,
        );
      }

      if (!connection?.workspace_id) {
        throw new UnauthorizedException('CRM Hub not activated');
      }
      this.logger.debug(
        `validate: hub_connection lookup OK, workspace_id=${connection.workspace_id}`,
      );

      const workspace = await this.workspaceRepository.findOne({
        where: { id: connection.workspace_id },
      });

      if (!isDefined(workspace)) {
        throw new UnauthorizedException('Twenty workspace not found');
      }
      this.logger.debug(`validate: workspace lookup OK, id=${workspace.id}`);

      const existingUser = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      const userData = isDefined(existingUser)
        ? ({ type: 'existingUser' as const, existingUser })
        : ({
            type: 'newUserWithPicture' as const,
            newUserWithPicture: this.buildPartialUser(payload),
          });

      this.logger.debug(
        `validate: calling signInUpOnExistingWorkspace (userData.type=${userData.type})`,
      );
      const user = await this.signInUpService.signInUpOnExistingWorkspace({
        workspace,
        userData,
      });

      this.logger.log(`validate: signInUpOnExistingWorkspace OK, userId=${user.id}`);

      const flatUser = await this.coreEntityCacheService.get('user', user.id);

      if (!isDefined(flatUser)) {
        throw new UnauthorizedException('User not available in cache');
      }

      const flatWorkspace = await this.coreEntityCacheService.get(
        'workspaceEntity',
        workspace.id,
      );

      if (!isDefined(flatWorkspace)) {
        throw new UnauthorizedException('Workspace not available in cache');
      }

      const { flatWorkspaceMemberMaps } =
        await this.workspaceCacheService.getOrRecompute(workspace.id, [
          'flatWorkspaceMemberMaps',
        ]);

      const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[user.id];
      const workspaceMember = isDefined(workspaceMemberId)
        ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
        : undefined;

      const userWorkspaceRow = await this.userWorkspaceRepository.findOne({
        where: { userId: user.id, workspaceId: workspace.id },
      });

      if (!isDefined(userWorkspaceRow)) {
        throw new UnauthorizedException('UserWorkspace link not found');
      }

      const flatUserWorkspace = await this.coreEntityCacheService.get(
        'userWorkspaceEntity',
        userWorkspaceRow.id,
      );

      if (!isDefined(flatUserWorkspace)) {
        throw new UnauthorizedException(
          'UserWorkspace not available in cache',
        );
      }

      this.logger.log(
        `validate: returning AuthContext (userId=${user.id}, workspaceId=${workspace.id}, authProvider=SSO)`,
      );

      return {
        user: flatUser,
        workspace: flatWorkspace,
        workspaceMember,
        workspaceMemberId,
        userWorkspace: flatUserWorkspace,
        userWorkspaceId: flatUserWorkspace.id,
        authProvider: AuthProviderEnum.SSO,
      };
    } catch (error) {
      const err = error as Error;

      this.logger.error(`validate FAILED: ${err.message}`, err.stack);
      throw error;
    }
  }

  private buildPartialUser(payload: SupabaseJwtPayload): PartialUserWithPicture {
    const fullName = payload.user_metadata?.full_name?.trim() ?? '';
    const [firstFromName, ...restName] = fullName.split(/\s+/);
    const emailPrefix = payload.email?.split('@')[0] ?? '';

    const firstName = firstFromName || emailPrefix;
    const lastName = restName.join(' ');

    return {
      email: payload.email,
      firstName,
      lastName,
      picture: payload.user_metadata?.avatar_url ?? '',
      locale: 'en',
      isEmailVerified: true,
    };
  }
}
