CREATE TABLE IF NOT EXISTS logicFunctionExecution
(
    `timestamp`                                  DateTime64(3) NOT NULL,
    `workspaceId`                                String NOT NULL,
    `applicationId`                              String DEFAULT '',
    `applicationUniversalIdentifier`             String DEFAULT '',
    `applicationRegistrationId`                  String DEFAULT '',
    `applicationRegistrationUniversalIdentifier` String DEFAULT '',
    `logicFunctionId`                            String DEFAULT '',
    `logicFunctionName`                          String DEFAULT '',
    `executionId`                                String DEFAULT '',
    `status`                                     LowCardinality(String) DEFAULT 'SUCCESS',
    `errorType`                                  String DEFAULT '',
    `durationMs`                                 Int64 DEFAULT 0,
    `creditsUsedMicro`                           Int64 DEFAULT 0,
    `source`                                     LowCardinality(String) DEFAULT 'MANUAL',
    `workflowId`                                 String DEFAULT '',
    `workflowVersionId`                          String DEFAULT '',
    `workflowRunId`                              String DEFAULT '',
    `executionMode`                              LowCardinality(String) DEFAULT ''
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (workspaceId, timestamp, applicationId, logicFunctionId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;
