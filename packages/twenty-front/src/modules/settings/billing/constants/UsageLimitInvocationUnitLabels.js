"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USAGE_LIMIT_INVOCATION_UNIT_LABELS = void 0;
const macro_1 = require("@lingui/core/macro");
const graphql_1 = require("~/generated-metadata/graphql");
exports.USAGE_LIMIT_INVOCATION_UNIT_LABELS = {
    [graphql_1.UsageOperationType.WORKFLOW_EXECUTION]: {
        name: (0, macro_1.msg) `Steps`,
        suffix: (0, macro_1.msg) `steps`,
    },
    [graphql_1.UsageOperationType.CODE_EXECUTION]: { name: (0, macro_1.msg) `Runs`, suffix: (0, macro_1.msg) `runs` },
    [graphql_1.UsageOperationType.WEB_SEARCH]: {
        name: (0, macro_1.msg) `Searches`,
        suffix: (0, macro_1.msg) `searches`,
    },
    [graphql_1.UsageOperationType.AI_WORKFLOW_WEB_SEARCH]: {
        name: (0, macro_1.msg) `Searches`,
        suffix: (0, macro_1.msg) `searches`,
    },
    [graphql_1.UsageOperationType.EMAIL_SEND]: { name: (0, macro_1.msg) `Emails`, suffix: (0, macro_1.msg) `emails` },
    [graphql_1.UsageOperationType.MESSAGE_CAMPAIGN_SEND]: {
        name: (0, macro_1.msg) `Emails`,
        suffix: (0, macro_1.msg) `emails`,
    },
};
