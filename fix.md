### **Auth-Related Files**

- [x] `auth.resolver.ts`
- [x] `auth.service.ts`
- [x] `google-apis-auth.controller.ts`
- [x] `google-auth.controller.ts`
- [x] `microsoft-apis-auth.controller.ts`
- [x] `microsoft-auth.controller.ts`
- [x] `sso-auth.controller.ts`

### **Domain Manager-Related Files**
- [x] `cloudflare.controller.ts`
- [x] `cloudflare.spec.ts`
- [x] `domain-manager.service.spec.ts`
- [x] `domain-manager.type.ts`

### **Email Verification-Related Files**
- [x] `email-verification.resolver.ts`
- [x] `email-verification.service.ts`

### **Environment-Related Files**
- [x] `environment-variables-group-position.ts` (D)

### **Google Cloud-Related Files**
- [x] `google-storage.service.ts`

### **Meta/WhatsApp-Related Files**
- [x] `firebase.service.ts`
- [x] `whatsapp-integration.service.ts`
- [x] `whatsapp.service.ts`

### **Messaging-Related Files**
- [X] `microsoft-get-message-list.service.dev.spec.ts`

### **Permissions/Guards-Related Files**
- [ ] `settings-permissions.guard.ts`

### **Resolver-Related Files**
- [x] `base-resolver-service.ts`
- [x] `user.resolver.ts`

### **Workspace-Related Files**
- [x] `admin-panel.service.ts`
- [x] `connected-account.workspace-entity.ts`
- [x] `core-query-builder.factory.ts`
- [x] `data-seed-dev-workspace.command.ts`
- [x] `user-workspace.service.ts`
- [x] `workspace-invitation.service.ts`
- [x] `workspace-manager.service.ts`
- [x] `workspace-member.workspace-entity.ts`
- [x] `workspace.service.ts`

## Auth Guards
- [x] google-apis-oauth-exchange-code-for-token.guard.ts
- [x] google-apis-oauth-request-code.guard.ts
- [x] google-oauth.guard.ts
- [x] google-provider-enabled.guard.ts
- [x] microsoft-apis-oauth-exchange-code-for-token.guard.ts
- [x] microsoft-apis-oauth-request-code.guard.ts
- [x] microsoft-oauth.guard.ts
- [x] microsoft-provider-enabled.guard.ts
- [x] enterprise-features-enabled.guard.ts
- [x] oidc-auth.guard.ts
- [x] saml-auth.guard.ts

## Billing Services
- [x] billing-portal.workspace-service.ts

## Workspace Modules
- [x] public-workspace-data-output.ts
- [x] workspace.resolver.ts

## Database Seeds
- [x] feature-flags.ts

## Auth GraphQL Queries
- [x] checkUserExists.ts
- [X] getPublicWorkspaceDataByDomain.ts

## Users GraphQL Fragments
- [X] userQueryFragment.ts

## Workspace GraphQL Mutations
- [x] updateWorkspace.ts

## Workspace GraphQL Queries
- [x] getCustomDomainDetails.ts
- [x] getHostnameDetails.ts