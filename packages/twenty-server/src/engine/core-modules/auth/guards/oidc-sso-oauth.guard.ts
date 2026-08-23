import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OidcSocialOauthGuard extends AuthGuard('openid-connect') {}
