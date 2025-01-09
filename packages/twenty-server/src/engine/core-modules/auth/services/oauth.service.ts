// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
//
// import crypto from 'crypto';
//
// import { Repository } from 'typeorm';
//
// import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
// import {
//   AuthException,
//   AuthExceptionCode,
// } from 'src/engine/core-modules/auth/auth.exception';
// import { ExchangeAuthCode } from 'src/engine/core-modules/auth/dto/exchange-auth-code.entity';
// import { ExchangeAuthCodeInput } from 'src/engine/core-modules/auth/dto/exchange-auth-code.input';
// import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
// import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
// import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
// import { User } from 'src/engine/core-modules/user/user.entity';
// import { userValidator } from 'src/engine/core-modules/user/user.validate';
//
// @Injectable()
// export class OAuthService {
//   constructor(
//     @InjectRepository(User, 'core')
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(AppToken, 'core')
//     private readonly appTokenRepository: Repository<AppToken>,
//     private readonly accessTokenService: AccessTokenService,
//     private readonly refreshTokenService: RefreshTokenService,
//     private readonly loginTokenService: LoginTokenService,
//   ) {}
//
//   async verifyAuthorizationCode(
//     exchangeAuthCodeInput: ExchangeAuthCodeInput,
//   ): Promise<ExchangeAuthCode> {
//     const { authorizationCode, codeVerifier } = exchangeAuthCodeInput;
//
//     if (!authorizationCode) {
//       throw new AuthException(
//         'Authorization code not found',
//         AuthExceptionCode.INVALID_INPUT,
//       );
//     }
//
//     let userId = '';
//
//     if (codeVerifier) {
//       const authorizationCodeAppToken = await this.appTokenRepository.findOne({
//         where: {
//           value: authorizationCode,
//         },
//       });
//
//       if (!authorizationCodeAppToken) {
//         throw new AuthException(
//           'Authorization code does not exist',
//           AuthExceptionCode.INVALID_INPUT,
//         );
//       }
//
//       if (!(authorizationCodeAppToken.expiresAt.getTime() >= Date.now())) {
//         throw new AuthException(
//           'Authorization code expired.',
//           AuthExceptionCode.FORBIDDEN_EXCEPTION,
//         );
//       }
//
//       const codeChallenge = crypto
//         .createHash('sha256')
//         .update(codeVerifier)
//         .digest()
//         .toString('base64')
//         .replace(/\+/g, '-')
//         .replace(/\//g, '_')
//         .replace(/=/g, '');
//
//       const codeChallengeAppToken = await this.appTokenRepository.findOne({
//         where: {
//           value: codeChallenge,
//         },
//       });
//
//       if (!codeChallengeAppToken || !codeChallengeAppToken.userId) {
//         throw new AuthException(
//           'code verifier doesnt match the challenge',
//           AuthExceptionCode.FORBIDDEN_EXCEPTION,
//         );
//       }
//
//       if (!(codeChallengeAppToken.expiresAt.getTime() >= Date.now())) {
//         throw new AuthException(
//           'code challenge expired.',
//           AuthExceptionCode.FORBIDDEN_EXCEPTION,
//         );
//       }
//
//       if (codeChallengeAppToken.userId !== authorizationCodeAppToken.userId) {
//         throw new AuthException(
//           'authorization code / code verifier was not created by same client',
//           AuthExceptionCode.FORBIDDEN_EXCEPTION,
//         );
//       }
//
//       if (codeChallengeAppToken.revokedAt) {
//         throw new AuthException(
//           'Token has been revoked.',
//           AuthExceptionCode.FORBIDDEN_EXCEPTION,
//         );
//       }
//
//       await this.appTokenRepository.save({
//         id: codeChallengeAppToken.id,
//         revokedAt: new Date(),
//       });
//
//       userId = codeChallengeAppToken.userId;
//     }
//
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//       relations: ['defaultWorkspace'],
//     });
//
//     userValidator.assertIsDefinedOrThrow(
//       user,
//       new AuthException(
//         'User who generated the token does not exist',
//         AuthExceptionCode.INVALID_INPUT,
//       ),
//     );
//
//     if (!user.defaultWorkspace) {
//       throw new AuthException(
//         'User does not have a default workspace',
//         AuthExceptionCode.INVALID_DATA,
//       );
//     }
//
//     const accessToken = await this.accessTokenService.generateAccessToken(
//       user.id,
//       user.defaultWorkspaceId,
//     );
//     const refreshToken = await this.refreshTokenService.generateRefreshToken(
//       user.id,
//       user.defaultWorkspaceId,
//     );
//     const loginToken = await this.loginTokenService.generateLoginToken(
//       user.email,
//     );
//
//     return {
//       accessToken,
//       refreshToken,
//       loginToken,
//     };
//   }
// }
