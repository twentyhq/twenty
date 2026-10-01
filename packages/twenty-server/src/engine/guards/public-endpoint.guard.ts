import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

// Always passes: an explicit marker that the endpoint is intentionally
// accessible without authentication.
@Injectable()
export class PublicEndpointGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
