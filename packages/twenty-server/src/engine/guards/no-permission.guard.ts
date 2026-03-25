import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

// Guard that explicitly marks an endpoint as NOT requiring permission checks
// This guard always returns true and serves as explicit documentation that
// the endpoint intentionally bypasses standard permission validation
//
// Use this ONLY for special cases where permission checks don't apply:
// - Workspace initialization/onboarding flows
// - Public or semi-public endpoints
// - Self-service operations that don't require elevated permissions
//
// Examples: activateWorkspace (onboarding), user profile updates
//
// WARNING: Use sparingly! Most mutations should use SettingsPermissionGuard
// If you're unsure, use CustomPermissionGuard and implement checks in the method
@Injectable()
export class NoPermissionGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
