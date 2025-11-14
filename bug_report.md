# Bug Report: Workspace Migration Builder Worker Fails to Boot

## Summary
`nx run twenty-server:worker` (and any command that instantiates the workspace migration builder) currently crashes during NestJS bootstrap with `Nest can't resolve dependencies of the FlatFieldMetadataTypeValidatorService (?).` This blocks the `twenty` app start target and any worker processes.

## Environment / Scope
- Repo: `FLCRMLMS`
- Targets: `twenty-server:worker`, `twenty-server:start`, `twenty-server:typecheck`
- Modules involved: `WorkspaceMigrationBuilderValidatorsModule`, `FlatFieldMetadataTypeValidatorService`, `FeatureFlagModule`

## Steps to Reproduce
1. From the repo root, run `npx nx run twenty-server:worker`.
2. Wait for NestJS to bootstrap the worker application.
3. Observe the crash in the worker process (NX exits with code 1 and propagates the failure to other targets).

## Expected Result
The worker should start successfully, loading `WorkspaceMigrationBuilderValidatorsModule` and exposing the validator services without dependency injection errors.

## Actual Result
NestJS reports:
```
ERROR [ExceptionHandler] Nest can't resolve dependencies of the FlatFieldMetadataTypeValidatorService (?). Please make sure that the argument Object at index [0] is available in the WorkspaceMigrationBuilderValidatorsModule context.
```
`NX` stops the entire `twenty:start` pipeline because `twenty-server:worker` and `twenty-server:typecheck` fail.

## Root Cause Analysis
- `FlatFieldMetadataTypeValidatorService` injects `FeatureFlagService` (constructor in `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service.ts:21`).
- The import is declared as `import { type FeatureFlagService } from ...` (line 7). Because it is marked `type`, TypeScript erases the value import in the emitted JS. When `emitDecoratorMetadata` runs, it cannot reference the runtime class and records the parameter type as `Object`.
- At runtime, NestJS attempts to resolve a provider for `Object`, fails, and throws the DI error above, even though `FeatureFlagModule` correctly exports `FeatureFlagService`.

This latent issue surfaced after updating toolchain/tsconfig because `tsc` now treats `import type` strictly, so metadata references disappear.

## Planned Fix
1. Update `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service.ts` to import `FeatureFlagService` as a value (remove the `type` qualifier). This ensures the constructor metadata contains the correct token.
2. Rebuild/test the worker to confirm Nest resolves the dependency.
3. (Optional hardening) Add a regression test or lint check to prevent `import type` on classes used in DI constructors.

## Status
- Reproduced locally and root cause identified.
- Implementation pending (trivial import change + verification).
