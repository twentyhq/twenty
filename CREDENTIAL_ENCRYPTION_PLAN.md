# Credential Encryption Implementation Plan

## Overview

Implement field-level encryption for sensitive credentials stored in the Twenty CRM database, leveraging AWS KMS for key management with workspace-scoped encryption keys.

**Scope**: Phase 1 focuses on `ConnectedAccount` entity only. Other entities (webhooks, SSO, app tokens) will be addressed in future phases.

## Current State

### Sensitive Fields Stored in Plain Text

| Entity | Fields | Risk Level | Phase |
|--------|--------|------------|-------|
| `ConnectedAccountWorkspaceEntity` | `accessToken`, `refreshToken`, `connectionParameters` (IMAP/SMTP/CalDAV passwords) | CRITICAL | **Phase 1** |
| `WebhookEntity` | `secret` | HIGH | Future |
| `WorkspaceSSOIdentityProviderEntity` | `clientSecret` | CRITICAL | Future |
| `AppTokenEntity` | `value` (various token types) | HIGH | Future |
| `TwoFactorAuthenticationMethodEntity` | `secret` | HIGH | Future |

### Existing Infrastructure to Build Upon

- **`auth.util.ts`** - AES-256-CTR encryption (lines 22-52) - needs upgrade to GCM
- **`JwtWrapperService.generateAppSecret()`** (line 139-148) - workspace-scoped key derivation pattern
- **`APP_SECRET`** - Master secret in environment variables
- **AWS Secrets Manager** - Already in use for production secrets

---

## Architecture Decisions

### 1. Key Management: APP_SECRET Default + Optional AWS KMS

**Default (Self-hosted / Development):**
```
APP_SECRET (environment variable)
        |
        v [HKDF derivation with workspace context + purpose]
  Workspace DEK (per-workspace)
        |
        v [AES-256-GCM]
  Encrypted Credential
```

**Production (AWS KMS enabled):**
```
AWS KMS CMK (Customer Master Key)
        |
        v [KMS Decrypt - cached 1hr]
  Master DEK (in Secrets Manager)
        |
        v [HKDF derivation with workspace context]
  Workspace DEK (per-workspace)
        |
        v [AES-256-GCM]
  Encrypted Credential
```

**Rationale**: APP_SECRET-based encryption works out-of-the-box for self-hosted users. AWS KMS is an optional upgrade for production deployments requiring HSM-backed security and audit logging.

### 2. Algorithm: AES-256-GCM (Authenticated Encryption)

**Rationale**: GCM provides both confidentiality and integrity (detects tampering). Current AES-256-CTR lacks integrity protection.

### 3. Encryption Layer: Service Level (Explicit)

**Rationale**: Matches existing `ConfigStorageService` pattern; easier to audit/debug than TypeORM transformers.

---

## Encrypted Data Format

```
$TWENTY_ENC$v1$AES-256-GCM${keyId}${iv}${authTag}${ciphertext}
```

- **Magic prefix** `$TWENTY_ENC$` - identifies encrypted data for backward compatibility
- **Version** `v1` - allows format evolution
- **IV** - 12-byte random nonce (base64)
- **AuthTag** - 16-byte authentication tag (base64)
- **Ciphertext** - encrypted data (base64)

---

## Implementation Plan

### Phase 1: Create Encryption Module

**New files to create:**

```
packages/twenty-server/src/engine/core-modules/credential-encryption/
  credential-encryption.module.ts
  credential-encryption.service.ts
  credential-encryption.exception.ts
  drivers/
    kms-encryption.driver.ts
    app-secret-encryption.driver.ts
    encryption-driver.interface.ts
  utils/
    encryption-format.util.ts
    key-derivation.util.ts
  types/
    encryption-purpose.type.ts
```

**Core service API:**

```typescript
class CredentialEncryptionService {
  encryptCredential(plaintext: string, workspaceId: string, purpose: EncryptionPurpose): Promise<string>;
  decryptCredential(ciphertext: string, workspaceId: string, purpose: EncryptionPurpose): Promise<string>;
  encryptJsonField<T>(data: T, workspaceId: string, purpose: EncryptionPurpose, sensitiveKeys: string[]): Promise<T>;
  decryptJsonField<T>(data: T, workspaceId: string, purpose: EncryptionPurpose, sensitiveKeys: string[]): Promise<T>;
}
```

**Encryption purposes:**
- `CONNECTED_ACCOUNT_TOKEN`
- `CONNECTED_ACCOUNT_CONNECTION_PARAMS`
- `WEBHOOK_SECRET`
- `SSO_CLIENT_SECRET`
- `APP_TOKEN`
- `TWO_FACTOR_SECRET`

### Phase 2: Add Configuration Variables

**File to modify:** `packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts`

Add new config group:
```typescript
ENCRYPTION_USE_AWS_KMS: boolean = false;
AWS_KMS_KEY_ID: string;
AWS_KMS_REGION: AwsRegion;
AWS_ENCRYPTED_MASTER_DEK_SECRET_ARN: string;
```

### Phase 3: ConnectedAccount Encryption Integration (Phase 1 Scope)

**Create wrapper service:**

1. **ConnectedAccountEncryptionService**
   - File: `packages/twenty-server/src/modules/connected-account/services/connected-account-encryption.service.ts`
   - Encrypts: `accessToken`, `refreshToken`, nested passwords in `connectionParameters`

2. **Update existing services to use encryption:**
   - `packages/twenty-server/src/engine/core-modules/auth/services/create-connected-account.service.ts` - Encrypt on account creation
   - `packages/twenty-server/src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service.ts` - Encrypt refreshed tokens
   - `packages/twenty-server/src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service.ts` - Decrypt tokens for API clients
   - `packages/twenty-server/src/modules/connected-account/services/imap-smtp-caldav-apis.service.ts` - Encrypt connection parameters
   - `packages/twenty-server/src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider.ts` - Decrypt connection params

**Future phases (not in scope):**
   - `webhook.service.ts`, `sso.service.ts`, `app-token.service.ts`

### Phase 4: Migration Commands

**Create migration commands:**

```
packages/twenty-server/src/database/commands/
  encrypt-credentials.command.ts    # Encrypt existing plaintext
  decrypt-credentials.command.ts    # Rollback (emergency)
  verify-encryption.command.ts      # Verify migration status
```

**Migration approach:**
1. Deploy code with encryption enabled for NEW records
2. Decryption handles both encrypted (prefixed) and unencrypted (legacy) data
3. Run background job to encrypt existing records in batches
4. Verify migration status with verification command

---

## Key Files to Modify (Phase 1)

| File | Change |
|------|--------|
| `packages/twenty-server/src/engine/core-modules/auth/auth.util.ts` | Add AES-256-GCM functions alongside existing CTR |
| `packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts` | Add encryption configuration group |
| `packages/twenty-server/src/engine/core-modules/auth/services/create-connected-account.service.ts` | Encrypt tokens before save |
| `packages/twenty-server/src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service.ts` | Encrypt refreshed tokens on save |
| `packages/twenty-server/src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service.ts` | Decrypt tokens before creating API clients |
| `packages/twenty-server/src/modules/connected-account/services/imap-smtp-caldav-apis.service.ts` | Encrypt connection parameters on save |
| `packages/twenty-server/src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider.ts` | Decrypt connection parameters |
| `packages/twenty-server/src/modules/calendar/calendar-event-import-manager/drivers/imap-caldav/imap-caldav-calendar-event.provider.ts` | Decrypt CalDAV params (if applicable) |

---

## Testing Strategy

1. **Unit tests** for encryption service (encrypt/decrypt roundtrip, workspace isolation, tamper detection)
2. **Integration tests** with LocalStack KMS
3. **Migration tests** on staging with production data clone
4. **Verify** encrypted data in DB cannot be read without proper keys

---

## Verification

```bash
# Run encryption service tests
npx nx test twenty-server --testPathPattern=credential-encryption

# Verify migration status
npx nx run twenty-server:command verify:encryption --workspace-id=<id>

# Test connected account flow end-to-end
# 1. Connect a Google/Microsoft account
# 2. Verify tokens are encrypted in DB (SELECT accessToken FROM connected_account)
# 3. Verify messaging sync still works (tokens decrypt correctly)
```

---

## Rollback Plan

1. **Code rollback**: Previous version handles encrypted data (decryption is backward compatible)
2. **Data rollback**: Run `decrypt:credentials` command to restore plaintext
3. **Emergency**: Feature flag `ENCRYPTION_ENABLED=false` skips encryption

---

## Dependencies to Add

```json
{
  "@aws-sdk/client-kms": "^3.x",
  "@aws-sdk/client-secrets-manager": "^3.x"
}
```

---

## Estimated Scope (Phase 1 - ConnectedAccount Only)

- **New files**: ~8 files (encryption module + migration commands)
- **Modified files**: ~8 files (connected account related services)
- **Migration**: Background job, zero-downtime
- **Future phases**: Webhooks, SSO, AppTokens (separate PRs)
