import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Guard that explicitly marks an endpoint as public/unprotected.
 * This guard always returns true and serves as documentation
 * that the endpoint is intentionally accessible without authentication.
 *
 * Usage: @UseGuards(PublicEndpoint)
 */
@Injectable()
export class PublicEndpoint implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Always allow access - this is an explicit marker for public endpoints
    return true;
  }
}
