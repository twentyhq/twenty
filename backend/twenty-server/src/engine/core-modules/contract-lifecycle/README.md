# Contract Lifecycle Management (CLM)

End-to-end contract management with templates, approval chains, redlining, digital signatures, obligation tracking, risk scoring, and renewal management.

## Entities
- `CLMContractEntity` — dealId, accountId, title, contractType, status, templateId, content, version, totalValue, startDate, endDate, autoRenew, obligations, slas, riskScore, signatureAudit, approvalChain, redlineHistory
- `CLMTemplateEntity` — name, type, content, lockedClauses, variables

## Service Methods
- `createFromDeal(workspaceId, dealId, templateId, data)` — creates contract from template with variable substitution
- `submitForApproval(contractId, chain)` — initiates approval workflow
- `approveStep(contractId, userId)` — approves a step in the chain
- `addRedline(contractId, userId, change)` — adds negotiation redline, increments version
- `signContract(contractId, signerId, ip)` — records digital signature with audit hash
- `getExpiringContracts(workspaceId, withinDays)` — contracts expiring soon
- `scoreRisk(contractId)` — risk scoring (auto-renew, penalties, value, notice period)
- `trackObligation(contractId, clause, responsible, dueDate)` — tracks obligation
- `completeObligation(contractId, clauseIndex)` — marks obligation complete
- `getOverdueObligations(workspaceId)` — overdue obligations across contracts
- `renewContract(contractId, newEndDate, adjustments)` — renews with optional adjustments
- `getAnalytics(workspaceId)` — active contracts, expiring, total value, avg risk

## Feature Flag
`IS_MODULE_CLM_ENABLED`

## Dependencies
- None
