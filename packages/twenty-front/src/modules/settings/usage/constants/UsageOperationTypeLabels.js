"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USAGE_OPERATION_TYPE_LABELS = void 0;
const macro_1 = require("@lingui/core/macro");
const graphql_1 = require("~/generated-metadata/graphql");
exports.USAGE_OPERATION_TYPE_LABELS = {
    [graphql_1.UsageOperationType.ALL]: (0, macro_1.msg) `All operations`,
    [graphql_1.UsageOperationType.AI_CHAT_TOKEN]: (0, macro_1.msg) `Chats`,
    [graphql_1.UsageOperationType.AI_WORKFLOW_TOKEN]: (0, macro_1.msg) `Agents`,
    [graphql_1.UsageOperationType.WORKFLOW_EXECUTION]: (0, macro_1.msg) `Workflow Execution`,
    [graphql_1.UsageOperationType.CODE_EXECUTION]: (0, macro_1.msg) `Code Execution`,
    [graphql_1.UsageOperationType.WEB_SEARCH]: (0, macro_1.msg) `Web Search`,
    [graphql_1.UsageOperationType.AI_WORKFLOW_WEB_SEARCH]: (0, macro_1.msg) `Agent Web Search`,
    [graphql_1.UsageOperationType.CALL_RECORDING]: (0, macro_1.msg) `Call Recording`,
    [graphql_1.UsageOperationType.EMAIL_SEND]: (0, macro_1.msg) `Email Send`,
    [graphql_1.UsageOperationType.MESSAGE_CAMPAIGN_SEND]: (0, macro_1.msg) `Campaign Email Send`,
    [graphql_1.UsageOperationType.API_REQUEST]: (0, macro_1.msg) `API Request`,
    [graphql_1.UsageOperationType.WEBHOOK_CALL]: (0, macro_1.msg) `Webhook Call`,
    [graphql_1.UsageOperationType.STORAGE_FILE]: (0, macro_1.msg) `File Storage`,
    [graphql_1.UsageOperationType.RECORD_WRITE]: (0, macro_1.msg) `Records`,
    [graphql_1.UsageOperationType.SUBSCRIPTION]: (0, macro_1.msg) `Subscription`,
};
