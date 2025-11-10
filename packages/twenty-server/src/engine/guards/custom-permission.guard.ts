import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

// Guard that explicitly marks an endpoint as having custom permission logic
// This guard always returns true and serves as documentation that the endpoint
// has custom permission checks implemented within the resolver method itself
//
// Use this when you need custom permission validation that cannot be expressed
// with standard SettingsPermissionGuard
//
// Examples of when to use CustomPermissionGuard:
// - Self-only operations (users can only modify their own data)
// - Complex permission logic (multiple conditions)
// - Dynamic permission requirements (depends on object type, record ownership, etc.)
@Injectable()
export class CustomPermissionGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
