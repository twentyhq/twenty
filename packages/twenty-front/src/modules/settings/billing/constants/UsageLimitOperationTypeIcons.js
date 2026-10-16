"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USAGE_LIMIT_OPERATION_TYPE_ICONS = void 0;
const icon_1 = require("twenty-ui/icon");
const graphql_1 = require("~/generated-metadata/graphql");
exports.USAGE_LIMIT_OPERATION_TYPE_ICONS = {
    [graphql_1.UsageOperationType.ALL]: icon_1.IconPlayerPlay,
    [graphql_1.UsageOperationType.AI_CHAT_TOKEN]: icon_1.IconMessage,
    [graphql_1.UsageOperationType.AI_WORKFLOW_TOKEN]: icon_1.IconLego,
    [graphql_1.UsageOperationType.WORKFLOW_EXECUTION]: icon_1.IconSettingsAutomation,
    [graphql_1.UsageOperationType.CODE_EXECUTION]: icon_1.IconCode,
    [graphql_1.UsageOperationType.WEB_SEARCH]: icon_1.IconSearch,
    [graphql_1.UsageOperationType.AI_WORKFLOW_WEB_SEARCH]: icon_1.IconSearch,
    [graphql_1.UsageOperationType.CALL_RECORDING]: icon_1.IconPhone,
    [graphql_1.UsageOperationType.EMAIL_SEND]: icon_1.IconMail,
    [graphql_1.UsageOperationType.MESSAGE_CAMPAIGN_SEND]: icon_1.IconSend,
    [graphql_1.UsageOperationType.API_REQUEST]: icon_1.IconApi,
    [graphql_1.UsageOperationType.WEBHOOK_CALL]: icon_1.IconWebhook,
    [graphql_1.UsageOperationType.STORAGE_FILE]: icon_1.IconFiles,
    [graphql_1.UsageOperationType.RECORD_WRITE]: icon_1.IconAddressBook,
    [graphql_1.UsageOperationType.SUBSCRIPTION]: icon_1.IconRepeat,
};
