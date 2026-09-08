CREATE TABLE IF NOT EXISTS appUsageEvent
(
    receiptId String,
    timestamp DateTime64(3),
    workspaceId String,
    periodStart DateTime64(3),
    userWorkspaceId String DEFAULT '',
    apiKeyId String DEFAULT '',
    applicationId String DEFAULT '',
    agentId String DEFAULT '',
    workflowId String DEFAULT '',
    logicFunctionId String DEFAULT '',
    resourceType LowCardinality(String),
    operationType LowCardinality(String),
    quantity Int64,
    unit LowCardinality(String),
    creditsUsedMicro Int64,
    resourceId String DEFAULT '',
    resourceContext String DEFAULT '',
    metadata JSON
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (workspaceId, receiptId)
TTL toDateTime(timestamp) + INTERVAL 3 YEAR DELETE;

-- FINAL makes a repeated delivery count once before background merges run.
CREATE VIEW IF NOT EXISTS billableUsageEvent AS
SELECT timestamp, workspaceId, periodStart, userWorkspaceId, apiKeyId,
       applicationId, agentId, workflowId, logicFunctionId, resourceType,
       operationType, quantity, unit, creditsUsedMicro, resourceId,
       resourceContext, metadata
FROM usageEvent
UNION ALL
SELECT timestamp, workspaceId, periodStart, userWorkspaceId, apiKeyId,
       applicationId, agentId, workflowId, logicFunctionId, resourceType,
       operationType, quantity, unit, creditsUsedMicro, resourceId,
       resourceContext, metadata
FROM appUsageEvent FINAL;
