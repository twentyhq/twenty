/* oxlint-disable */
// @ts-nocheck
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// This file was automatically generated — do not edit manually.

// prettier-ignore
export const mockedCommandMenuItems: CommandMenuItemFieldsFragment[] =
[
  {
    "__typename": "CommandMenuItem",
    "id": "deb9ec61-db41-4847-87d7-95250571d05c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATE_TO_NEXT_RECORD",
    "position": 1,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c8d0b8c3-2d35-5ea1-bff3-153cdf8f0be4",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "9a600a0c-4386-5250-a4c5-61860730986b",
          "value": "false",
          "operand": "IS",
          "contextKey": "isInSidePanel"
        },
        {
          "id": "f1a4844c-9cb3-57fc-82ee-1ab95462cef2",
          "value": "[\"messageCampaign\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        },
        {
          "id": "e3278481-99a6-54cd-bfc6-5ba1a4d67cac",
          "value": "[\"agentChatThread\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Navigate to next {objectLabelSingular}",
    "icon": "IconChevronDown",
    "shortLabel": null
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7a2902f3-1e50-41b5-b056-d82b5b726246",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATE_TO_PREVIOUS_RECORD",
    "position": 2,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c8d0b8c3-2d35-5ea1-bff3-153cdf8f0be4",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "9a600a0c-4386-5250-a4c5-61860730986b",
          "value": "false",
          "operand": "IS",
          "contextKey": "isInSidePanel"
        },
        {
          "id": "f1a4844c-9cb3-57fc-82ee-1ab95462cef2",
          "value": "[\"messageCampaign\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        },
        {
          "id": "e3278481-99a6-54cd-bfc6-5ba1a4d67cac",
          "value": "[\"agentChatThread\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Navigate to previous {objectLabelSingular}",
    "icon": "IconChevronUp",
    "shortLabel": null
  },
  {
    "__typename": "CommandMenuItem",
    "id": "cacfff5f-fe79-470f-a99d-2ba74ced4b45",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SHARE_RECORD",
    "position": 3,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "05a4bf32-444d-51c6-a702-8274d8c71173",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "1f028c27-934e-518b-9668-16413de17446",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Share {objectLabelSingular}",
    "icon": "IconShare",
    "shortLabel": "Share"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "305b5b2c-049d-45f8-8ec9-143d68b21960",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SHARE_RECORD",
    "position": 3,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "133016fb-8ccd-5296-bbce-4359b68c3442",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "4ccfc57e-cff6-5864-83d0-9fa2f5944f87",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_RECORD_LEVEL_SHARING_ENABLED"
        },
        {
          "id": "fdba48b1-5bc6-5c8f-93e8-d779e9d7ae8a",
          "value": "false",
          "operand": "IS",
          "contextKey": "objectMetadataItem",
          "subFieldName": "isSystem"
        },
        {
          "id": "f57bdb27-f62d-5230-8f36-5f2901a63c9b",
          "value": "[\"APPLICATION\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "readability"
        },
        {
          "id": "10e27192-0c7c-5166-8ca6-efe255ff37d8",
          "value": "[\"SYSTEM\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "readability"
        },
        {
          "id": "de14635a-b2d0-525c-96b6-0e26572f7bfd",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Share {objectLabelSingular}",
    "icon": "IconShare",
    "shortLabel": "Share"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "057226e8-b1b7-416d-807d-abb6bfa5a6bb",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "CREATE_NEW_RECORD",
    "position": 3,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "d918b256-4f26-554f-9a75-56eba5b948fc",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "54984bd9-1409-57f9-b352-06383620f177",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        },
        {
          "id": "46ebd89a-f3b5-5df0-89cc-daa112146e30",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        },
        {
          "id": "09d8c74d-5afb-527a-a12a-a57091015234",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectMetadataItem",
          "subFieldName": "isUICreatable"
        },
        {
          "id": "45daee2c-a34d-5ae2-afe0-472be989b0d5",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectMetadataItem",
          "subFieldName": "isUIEditable"
        },
        {
          "id": "356b1b85-5efa-52df-8917-36252a0abd5f",
          "value": "false",
          "operand": "IS",
          "contextKey": "objectMetadataItem",
          "subFieldName": "isRemote"
        }
      ]
    },
    "conditionalPinned": {
      "recordFilters": [
        {
          "id": "eb320d5e-0d23-57f8-a05d-f7f8972f1f52",
          "value": "0",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        }
      ]
    },
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Create {objectLabelSingular}",
    "icon": "IconPlus",
    "shortLabel": "Create"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "e46ec0c8-8e48-4549-ba10-e9be016b29d0",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DELETE_RECORDS",
    "position": 4,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "ee8fc1b3-1945-5270-b122-6195b75436a5",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "bcc5b074-d7a2-5a0c-a8b6-c7194225c721",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView",
          "recordFilterGroupId": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "bd287d44-6665-5978-8742-b7614596fe8d",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canSoftDeleteObjectRecords",
          "recordFilterGroupId": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "0be12531-269d-5409-bfd5-f45cf1fbe5e0",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "292c4ea7-6f0f-5b9e-a107-300e171c38d0",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "386d0124-18c3-54a4-8373-f7ad896ca69b",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "292c4ea7-6f0f-5b9e-a107-300e171c38d0",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "21048ff8-ce8f-5f8e-8588-5c0e01cdcb81",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "9ff0909c-ecb9-5993-b859-225ae6e3ac6b",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "528ddfdf-5768-538d-bb43-9805b57db5bd",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canSoftDelete",
          "recordFilterGroupId": "9ff0909c-ecb9-5993-b859-225ae6e3ac6b",
          "positionInRecordFilterGroup": 1
        }
      ],
      "recordFilterGroups": [
        {
          "id": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "logicalOperator": "AND"
        },
        {
          "id": "292c4ea7-6f0f-5b9e-a107-300e171c38d0",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "9ff0909c-ecb9-5993-b859-225ae6e3ac6b",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "8c09f2f1-b559-535c-8382-c6d7cf7a0805",
          "positionInRecordFilterGroup": 4
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Delete {objectLabel}",
    "icon": "IconTrash",
    "shortLabel": "Delete"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "6d4ac112-4c07-497c-8876-102efde86795",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "RESTORE_RECORDS",
    "position": 5,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "12fc1ef3-6fa2-54d4-8629-f22ba0f9507c",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "e4523e9f-0bac-5212-afaa-01659441935e",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "33cab78c-99f7-52a2-be78-41216ab68c46",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "8341ced7-12dd-5528-ac87-a95ad33dead4",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "33cab78c-99f7-52a2-be78-41216ab68c46",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "1d6e018c-5ade-5485-85be-db4457f69a2e",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canSoftDeleteObjectRecords",
          "recordFilterGroupId": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "db880ca8-7236-59ca-9d15-46082efbbb0c",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType",
          "recordFilterGroupId": "1a9b483e-4da7-52fd-82c2-117c69b5ce8e",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "f7721f6c-9269-511e-859d-4527cf3ebe8a",
          "value": "true",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView",
          "recordFilterGroupId": "1a9b483e-4da7-52fd-82c2-117c69b5ce8e",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "dae1da73-2da1-540a-90eb-20641933ae41",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "be7316e2-47a7-5d9b-8a25-139909681a0c",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "a80fb1f5-aca4-52aa-9cfd-6dec2df90176",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canSoftDelete",
          "recordFilterGroupId": "be7316e2-47a7-5d9b-8a25-139909681a0c",
          "positionInRecordFilterGroup": 1
        }
      ],
      "recordFilterGroups": [
        {
          "id": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "logicalOperator": "AND"
        },
        {
          "id": "33cab78c-99f7-52a2-be78-41216ab68c46",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "1a9b483e-4da7-52fd-82c2-117c69b5ce8e",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "be7316e2-47a7-5d9b-8a25-139909681a0c",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "cb991a43-30e7-5a14-a5b0-03c7a808dec1",
          "positionInRecordFilterGroup": 4
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Restore {objectLabel}",
    "icon": "IconRefresh",
    "shortLabel": "Restore"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "4ee9930f-3a86-4238-a26b-7cee5af0d74f",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DESTROY_RECORDS",
    "position": 6,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "10fabfb4-99ed-5273-a429-f935588d5ab3",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "0a04c515-84fc-5886-80fb-18fc0b86b67a",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canDestroyObjectRecords",
          "recordFilterGroupId": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "046f0293-1fb2-5371-8c02-513bb5744316",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "7e65b191-8be7-5f09-a9af-3ee51ad44371",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "316b5869-7025-5815-a203-ecc4ec8d6165",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "7e65b191-8be7-5f09-a9af-3ee51ad44371",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "cff7fc35-d03e-5549-84a9-25c0376837e8",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType",
          "recordFilterGroupId": "59f04802-6855-5855-a226-200b013f088f",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "e362d059-d847-5b21-a44e-cbe8b789b266",
          "value": "true",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView",
          "recordFilterGroupId": "59f04802-6855-5855-a226-200b013f088f",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "2ba64dc7-1207-5b79-a933-a781412f2942",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "9fa398ce-0560-5ce0-ad7b-80cbf74ea157",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "da7f6a58-175a-5532-94f9-13c9eea3eea3",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canDelete",
          "recordFilterGroupId": "9fa398ce-0560-5ce0-ad7b-80cbf74ea157",
          "positionInRecordFilterGroup": 1
        }
      ],
      "recordFilterGroups": [
        {
          "id": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "logicalOperator": "AND"
        },
        {
          "id": "7e65b191-8be7-5f09-a9af-3ee51ad44371",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "59f04802-6855-5855-a226-200b013f088f",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "9fa398ce-0560-5ce0-ad7b-80cbf74ea157",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "9506897d-3057-52b3-a2c2-fb78bfb4d68e",
          "positionInRecordFilterGroup": 4
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Permanently destroy {objectLabel}",
    "icon": "IconTrashX",
    "shortLabel": "Destroy"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "34d5e122-4b48-4626-a677-68f35c5549ef",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ADD_TO_FAVORITES",
    "position": 7,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "b67003b3-c5ad-5ec6-896c-026595443413",
          "value": "false",
          "operand": "IS",
          "contextKey": "areAllSelectedRecordsFavorites"
        },
        {
          "id": "7aeec769-65f9-5dff-9b96-a8b252635c48",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "b60e2336-5796-5d68-a27d-48845bf6ec07",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        },
        {
          "id": "4850da95-60ad-5105-9a4f-32955b7ffd00",
          "value": "[\"messageCampaign\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        },
        {
          "id": "6f14cef3-c8b2-58d0-9275-161702fba3ec",
          "value": "[\"workflow\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Add to Favorites",
    "icon": "IconHeart",
    "shortLabel": null
  },
  {
    "__typename": "CommandMenuItem",
    "id": "629f488b-a63e-4434-b85f-1f221b609ec5",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "REMOVE_FROM_FAVORITES",
    "position": 8,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "23959f62-7700-50be-bbb2-6c251549afed",
          "value": "true",
          "operand": "IS",
          "contextKey": "areAllSelectedRecordsFavorites"
        },
        {
          "id": "8608c896-a4c9-5e0d-aeee-6e9f31df9e88",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "37ecfc4f-72c0-52e5-97da-aacf0ecd5b86",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        },
        {
          "id": "b8e89a2e-868f-5e3a-b426-0b7c01ea73ce",
          "value": "[\"messageCampaign\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        },
        {
          "id": "8c19c5fd-2030-5da4-ae12-ace8cb6fa5f5",
          "value": "[\"workflow\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Remove from Favorites",
    "icon": "IconHeartOff",
    "shortLabel": null
  },
  {
    "__typename": "CommandMenuItem",
    "id": "5ba678a9-d432-41d1-a9c6-440206caaf52",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EXPORT_RECORDS",
    "position": 10,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "0cba3098-85f1-51fe-a92d-e223e6ba6081",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "c7628efd-b3ff-5f67-b3cc-a89534e9e5c5",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "EXPORT_CSV"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Export {objectLabel}",
    "icon": "IconFileExport",
    "shortLabel": "Export"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "60bd2f3c-3e80-4d67-a4f8-9e4ea9613771",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "UPDATE_MULTIPLE_RECORDS",
    "position": 11,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "855cab9b-03e6-5a12-835a-65d76d06453a",
          "value": "2",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "0c95de7c-5b96-523f-ba3b-6c718023b841",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Update {objectLabelPlural}",
    "icon": "IconEdit",
    "shortLabel": "Update"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "9f8f0fb4-2fa6-463b-9027-3509b0314968",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "MERGE_MULTIPLE_RECORDS",
    "position": 12,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "530a3cc0-c89d-5d06-8107-ca165b29578a",
          "value": "false",
          "operand": "IS",
          "contextKey": "isSelectAll"
        },
        {
          "id": "47d61333-071c-5fa4-867d-5f199ae395a9",
          "value": "2",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "d29af885-4fac-5837-bb8e-4b9082671ca2",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "objectMetadataItem",
          "subFieldName": "duplicateCriteria"
        },
        {
          "id": "ccc946cb-aed5-59a8-bbf9-6b5e28f5783c",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        },
        {
          "id": "5a62d78d-af4f-5f68-95cf-26eea6a0f7e3",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canDestroyObjectRecords"
        },
        {
          "id": "25e93671-ae65-529b-aa3a-c124e9c33c6a",
          "value": "9",
          "operand": "LESS_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Merge {objectLabelPlural}",
    "icon": "IconArrowMerge",
    "shortLabel": "Merge"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "1f14b016-6d3d-4c5a-9ea8-c37e9c6183d1",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "IMPORT_RECORDS",
    "position": 13,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "5d36cee8-ebc6-54a8-9105-0f6de34cf04b",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "2d27d4f4-1456-5c8b-b9d3-a839cc93949a",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        },
        {
          "id": "c87eed9d-b634-52fa-af81-d38a417f300b",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "IMPORT_CSV"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Import {objectLabelPlural}",
    "icon": "IconFileImport",
    "shortLabel": "Import"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "96d0701a-3859-4c36-aa2a-7a4e04279130",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EXPORT_VIEW",
    "position": 14,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "0cba3098-85f1-51fe-a92d-e223e6ba6081",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "c7628efd-b3ff-5f67-b3cc-a89534e9e5c5",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "EXPORT_CSV"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Export View",
    "icon": "IconFileExport",
    "shortLabel": "Export"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "02cfbb98-7df8-4148-bb70-547cd0e3f337",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_DELETED_RECORDS",
    "position": 15,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "55364171-1160-5b80-b33c-f3a59be908e2",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "2ac8c799-c880-5874-a026-ae895f5c0c7a",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See deleted {objectLabelPlural}",
    "icon": "IconRotate2",
    "shortLabel": "Deleted {objectLabelPlural}"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "59f1b996-66f9-46cf-9b91-071269a10545",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "CREATE_NEW_VIEW",
    "position": 16,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "55364171-1160-5b80-b33c-f3a59be908e2",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "2ac8c799-c880-5874-a026-ae895f5c0c7a",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Create View",
    "icon": "IconLayout",
    "shortLabel": "Create View"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "add6279c-0c86-40e6-af54-72a8254bf3ba",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "HIDE_DELETED_RECORDS",
    "position": 17,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a8f16ded-2de3-5b3d-9ad6-08fac474a5d5",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "514fd09c-4c8b-55ab-a459-003085bfd318",
          "value": "true",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Hide deleted {objectLabelPlural}",
    "icon": "IconEyeOff",
    "shortLabel": "Hide deleted"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "80c04b43-c7b2-473d-8c4a-ad6d7614339e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EDIT_RECORD_PAGE_LAYOUT",
    "position": 18,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "6ea01273-2c68-5f20-86ed-8a82421cb526",
          "value": "[\"SETTINGS_PAGE\"]",
          "operand": "IS_NOT",
          "contextKey": "pageType"
        },
        {
          "id": "cfade857-4a77-51e8-b8ef-c411a608e223",
          "value": "false",
          "operand": "IS",
          "contextKey": "isLayoutCustomizationModeEnabled"
        },
        {
          "id": "a81d9ec7-ae18-53a4-9465-ff7b5c24ccb0",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "LAYOUTS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Edit Layout",
    "icon": "IconPencil",
    "shortLabel": "Edit Layout"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "019dbf43-e265-40b5-b55b-94d816b65299",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EDIT_DASHBOARD_LAYOUT",
    "position": 19,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "bda7d4d4-75fe-5f42-b9ea-8802a1c568a0",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "f5177bc2-6c2e-59c1-8cd2-359ed8563059",
          "value": "false",
          "operand": "IS",
          "contextKey": "isDashboardPageLayoutInEditMode"
        },
        {
          "id": "74772b21-f647-5c7d-a142-11a6ded10ea3",
          "value": "false",
          "operand": "IS",
          "contextKey": "isLayoutCustomizationModeEnabled"
        },
        {
          "id": "2c306ef6-8833-5039-b957-f2a386cfc9fc",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "f004b04b-5104-5887-9920-346dea4118b6",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "pageLayoutId"
        },
        {
          "id": "54ac1921-0d38-563e-96b1-81cb633475cf",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "74bb8fe8-a9ce-4f64-baf5-77e9c2252920",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Edit Dashboard",
    "icon": "IconPencil",
    "shortLabel": "Edit"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "9509aac8-e4eb-456a-b4de-26e8a720d811",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SAVE_DASHBOARD_LAYOUT",
    "position": 20,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "1c85fe87-c264-5b1d-9f64-efedd590ce78",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "69007a31-7838-5ff8-9e48-3deedfbaa88f",
          "value": "true",
          "operand": "IS",
          "contextKey": "isDashboardPageLayoutInEditMode"
        },
        {
          "id": "fdc8603a-a56d-5658-8a34-8d20043edcbb",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "da4e21f5-1954-5454-b468-b8a9c8472898",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "pageLayoutId"
        },
        {
          "id": "435c6e0f-3336-5c8f-988b-7ea8357a0d0e",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "74bb8fe8-a9ce-4f64-baf5-77e9c2252920",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Save Dashboard",
    "icon": "IconDeviceFloppy",
    "shortLabel": "Save"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3a3f6987-98fc-4595-88eb-33183ee5e4e1",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "CANCEL_DASHBOARD_LAYOUT",
    "position": 21,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "1c85fe87-c264-5b1d-9f64-efedd590ce78",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "69007a31-7838-5ff8-9e48-3deedfbaa88f",
          "value": "true",
          "operand": "IS",
          "contextKey": "isDashboardPageLayoutInEditMode"
        },
        {
          "id": "fdc8603a-a56d-5658-8a34-8d20043edcbb",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "da4e21f5-1954-5454-b468-b8a9c8472898",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "pageLayoutId"
        },
        {
          "id": "435c6e0f-3336-5c8f-988b-7ea8357a0d0e",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "74bb8fe8-a9ce-4f64-baf5-77e9c2252920",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Cancel Edition",
    "icon": "IconCancel",
    "shortLabel": "Cancel"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3f6269f5-9369-4742-930f-23626b00be1d",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DUPLICATE_DASHBOARD",
    "position": 22,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "09ae8267-43b6-5a20-b7d5-8776c0da721f",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "d2fb8f22-6e00-50a8-b5c9-5dcf4be902f0",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "74bb8fe8-a9ce-4f64-baf5-77e9c2252920",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Duplicate Dashboard",
    "icon": "IconCopyPlus",
    "shortLabel": "Duplicate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b86152ad-8e3f-4616-870e-0dafe4bcd4d8",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ACTIVATE_WORKFLOW",
    "position": 23,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "d3f6f4fc-5781-5166-aac9-8d9f31cb20ed",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "244c32eb-8179-5a9e-8a96-ae7a4736a00b",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger",
          "recordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "b1688102-0d2f-548f-801c-89eba8d6f0a0",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps",
          "recordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "6a9abbd8-4c35-53e6-aafe-7720f5b8ff10",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps",
          "recordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "52e92b6f-b17c-57bf-af02-be54ea2808f4",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.status",
          "recordFilterGroupId": "37e4bc91-09bd-517a-8b6f-ea7301440c52",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "156e356d-2d0e-5220-ac6e-50c09ee965cb",
          "value": "\"ACTIVE\"",
          "operand": "DOES_NOT_CONTAIN",
          "contextKey": "selectedRecords",
          "subFieldName": "statuses",
          "recordFilterGroupId": "37e4bc91-09bd-517a-8b6f-ea7301440c52",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "211d5470-01f1-5d3d-bf1a-5a1d03378ccf",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 5
        }
      ],
      "recordFilterGroups": [
        {
          "id": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "logicalOperator": "AND"
        },
        {
          "id": "37e4bc91-09bd-517a-8b6f-ea7301440c52",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "61c485e6-aa84-5d57-98aa-efc0407b31ce",
          "positionInRecordFilterGroup": 4
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Activate Workflow",
    "icon": "IconPower",
    "shortLabel": "Activate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "4bca6e9a-b991-439d-b1b2-9fc4228abb4f",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DEACTIVATE_WORKFLOW",
    "position": 24,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "935cbcb1-323f-578f-87d8-ece70c5d4dc2",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "49be7794-f709-53b6-9499-8d62227fb359",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "2e0ded69-ec57-5bbe-8f9b-8cdcb0151acf",
          "value": "\"ACTIVE\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.status",
          "recordFilterGroupId": "a71ca65d-6e2a-5616-94f8-1d9b6c4f6c84",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "056c1709-191a-57b9-a92c-e36be6ff34fd",
          "value": "\"ACTIVE\"",
          "operand": "CONTAINS",
          "contextKey": "selectedRecords",
          "subFieldName": "statuses",
          "recordFilterGroupId": "a71ca65d-6e2a-5616-94f8-1d9b6c4f6c84",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "aa0a3794-dbdf-555c-8895-af4415fd3f3c",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "49be7794-f709-53b6-9499-8d62227fb359",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "0360c9a0-b6f5-53f6-a269-c0513d4702ff",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canUpdate",
          "recordFilterGroupId": "49be7794-f709-53b6-9499-8d62227fb359",
          "positionInRecordFilterGroup": 3
        }
      ],
      "recordFilterGroups": [
        {
          "id": "49be7794-f709-53b6-9499-8d62227fb359",
          "logicalOperator": "AND"
        },
        {
          "id": "a71ca65d-6e2a-5616-94f8-1d9b6c4f6c84",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "49be7794-f709-53b6-9499-8d62227fb359",
          "positionInRecordFilterGroup": 1
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Deactivate Workflow",
    "icon": "IconPlayerPause",
    "shortLabel": "Deactivate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "5cbe333b-e1e0-47c9-9756-c68e0f283ed2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DISCARD_DRAFT_WORKFLOW",
    "position": 25,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "36e3ad72-6ddd-5df5-85ac-cad556bb3ad1",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "lastPublishedVersionId"
        },
        {
          "id": "65e880a0-4fbe-5312-9fa9-fb2d119c5c0d",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.status"
        },
        {
          "id": "8c50e428-9bf0-5428-87b5-174cdf6ed077",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Discard Draft",
    "icon": "IconNoteOff",
    "shortLabel": "Discard Draft"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "d820a7e7-29a6-4fdf-9e64-e4a790afd0f6",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "TEST_WORKFLOW",
    "position": 26,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "218d7cde-f4d6-511d-99c6-bf623bb19664",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "eb466879-ce37-5992-9b25-7570b6b1c9a2",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger",
          "recordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "acc18934-c7cc-5de4-a86c-7c7d6bd85f4d",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps",
          "recordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "6ac18d4c-eabc-5ca7-a7a4-f6fcf8da3d92",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps",
          "recordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "80b1e899-199f-5a8a-aa2d-140f79a50ddc",
          "value": "\"MANUAL\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger.type",
          "recordFilterGroupId": "bf9c58b8-22c3-5f6a-9140-269abf596d85",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "d221ec12-cbe6-53f1-b037-ede8e313fc8e",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger.settings.objectType",
          "recordFilterGroupId": "bf9c58b8-22c3-5f6a-9140-269abf596d85",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "9e71619e-607b-517b-86a4-ebb34d19738c",
          "value": "\"WEBHOOK\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger.type",
          "recordFilterGroupId": "82a57ba3-ade9-53b2-b32d-a41fbc1af2af",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "51b3471b-71f5-5b6a-9cbe-659953fea33e",
          "value": "\"CRON\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger.type",
          "recordFilterGroupId": "82a57ba3-ade9-53b2-b32d-a41fbc1af2af",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "71b9b11f-622a-5fad-98a3-79223378d402",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 5
        }
      ],
      "recordFilterGroups": [
        {
          "id": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "logicalOperator": "AND"
        },
        {
          "id": "82a57ba3-ade9-53b2-b32d-a41fbc1af2af",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "25e1b770-00e9-5b26-9a39-fe66154591cc",
          "positionInRecordFilterGroup": 4
        },
        {
          "id": "bf9c58b8-22c3-5f6a-9140-269abf596d85",
          "logicalOperator": "AND",
          "parentRecordFilterGroupId": "82a57ba3-ade9-53b2-b32d-a41fbc1af2af",
          "positionInRecordFilterGroup": 0
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Test Workflow",
    "icon": "IconPlayerPlay",
    "shortLabel": "Test"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "cc2133de-0934-4c1c-8ee1-809c6315d85f",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_RUNS_WORKFLOW",
    "position": 28,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "05a4bf32-444d-51c6-a702-8274d8c71173",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "1f028c27-934e-518b-9668-16413de17446",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Runs",
    "icon": "IconHistoryToggle",
    "shortLabel": "See Runs"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "dc23ca8d-95e0-4989-9e6b-5f2aa1bb614a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_VERSIONS_WORKFLOW",
    "position": 29,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "05a4bf32-444d-51c6-a702-8274d8c71173",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "1f028c27-934e-518b-9668-16413de17446",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Versions History",
    "icon": "IconVersions",
    "shortLabel": "See Versions"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "49428d7d-ad7d-4b88-8d97-bce36d50b88d",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "TIDY_UP_WORKFLOW",
    "position": 31,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a2a69433-23a8-5218-ad8b-ddfefe5bf0c3",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "b0888b13-1db5-5fb5-b685-60c7aad2f7c2",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.trigger"
        },
        {
          "id": "14c286e6-54bc-565a-b441-835af354560f",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps"
        },
        {
          "id": "0a1d168b-acf4-5072-b71a-cfe51ca704fb",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion.steps"
        },
        {
          "id": "4de134c3-1db8-5f97-b749-ec8f292c72bb",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "60957185-7c32-5a80-aae3-34d75bb93e8c",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canUpdate"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Tidy up Workflow",
    "icon": "IconReorder",
    "shortLabel": "Tidy up"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2d4fb5e1-0727-4549-8bc4-f96e8ae461eb",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DUPLICATE_WORKFLOW",
    "position": 32,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "5adfcdbd-e8a7-5d68-846d-afd51a6e576e",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "currentVersion"
        },
        {
          "id": "fa362867-1bbf-5924-9b2f-b6946ff4b92c",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "1036ca83-acf7-5548-83b1-bd52e3827416",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canUpdate"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Duplicate Workflow",
    "icon": "IconCopy",
    "shortLabel": "Duplicate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2f74c07b-207b-4c71-ae94-6d5ef744be22",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "TOGGLE_WORKFLOW_VISIBILITY",
    "position": 33,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "10feda32-2eee-5370-8099-4fdaeb6eae29",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "083d20e7-8b25-57c3-aa3b-8ee2a96f4980",
          "value": "\"WORKSPACE\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "visibility"
        },
        {
          "id": "138fed2b-41f4-51c2-b012-cd6fc1640b22",
          "value": "true",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "canChangeVisibility"
        },
        {
          "id": "aec1c4e7-29e2-5880-9a25-79e1f33ed7b3",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "4f060606-e6d5-53a6-b5a5-6d362f9cb71f",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canUpdate"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Make Workflow Private",
    "icon": "IconCircleDashed",
    "shortLabel": "Make Private"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "0a8850f3-7a0d-4bfd-bdd5-50123bccb7cf",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "TOGGLE_WORKFLOW_VISIBILITY",
    "position": 33,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "46a494ac-eb28-5967-b786-4f1fb5f07c1f",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "dd1eea1d-945e-5e0f-bc01-ee9779bb222c",
          "value": "\"PRIVATE\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "visibility"
        },
        {
          "id": "b28441f5-798d-535c-9740-e01df8ddbc88",
          "value": "true",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "canChangeVisibility"
        },
        {
          "id": "b67d4986-21c4-5d33-9bd9-4de5bba69396",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Share Workflow with Workspace",
    "icon": "IconCircle",
    "shortLabel": "Share with Workspace"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "1a8bf882-ccea-4be1-9d4d-9e7dcbef53f1",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_WORKFLOW_WORKFLOW_RUN",
    "position": 34,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "ccd38f2f-9838-4a63-b3d4-a0de38cd2785",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Workflow",
    "icon": "IconSettingsAutomation",
    "shortLabel": "See Workflow"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b58cd188-21c4-4c5c-a9df-d4687b0ed803",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "STOP_WORKFLOW_RUN",
    "position": 35,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "0e697990-55eb-53aa-9265-52b769871078",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "21ab452e-c475-59e4-ac2d-0bf38ac3b0f2",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "67f8a70d-3b35-55b5-b3c9-7918af43bec5",
          "value": "\"NOT_STARTED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "21ab452e-c475-59e4-ac2d-0bf38ac3b0f2",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "77a7c3a8-ae07-5275-9cf2-e76752ce7e00",
          "value": "\"ENQUEUED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "21ab452e-c475-59e4-ac2d-0bf38ac3b0f2",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "c0447d6b-d7de-5871-a3ba-963ac8c78b29",
          "value": "\"RUNNING\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "21ab452e-c475-59e4-ac2d-0bf38ac3b0f2",
          "positionInRecordFilterGroup": 3
        }
      ],
      "recordFilterGroups": [
        {
          "id": "21ab452e-c475-59e4-ac2d-0bf38ac3b0f2",
          "logicalOperator": "OR"
        }
      ],
      "selectedRecordsMatch": "SOME"
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "ccd38f2f-9838-4a63-b3d4-a0de38cd2785",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Stop",
    "icon": "IconPlayerStop",
    "shortLabel": "Stop"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "82abe77c-06e8-47db-9134-01c95b8d79f0",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "RETRY_WORKFLOW_RUN",
    "position": 36,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "d343ba01-6b08-5226-a49e-61037dfc990d",
          "value": "\"FAILED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status"
        }
      ],
      "selectedRecordsMatch": "SOME"
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "ccd38f2f-9838-4a63-b3d4-a0de38cd2785",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Retry",
    "icon": "IconRefresh",
    "shortLabel": "Retry"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "054c7ee7-eb6a-49e4-9a7a-cf1e72315207",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_RUNS_WORKFLOW_VERSION",
    "position": 37,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a20750ba-20b5-554b-ac64-ead1a7832009",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "workflow"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e594e2c1-4935-43a6-ba6e-3987bf9b10cb",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Runs",
    "icon": "IconHistoryToggle",
    "shortLabel": "See Runs"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c201bc77-9ed9-4559-a719-f3d7ae7f9334",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_WORKFLOW_WORKFLOW_VERSION",
    "position": 38,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "045b84e1-d67e-5ba8-a9d1-1fd3633afe01",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "workflow.id"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e594e2c1-4935-43a6-ba6e-3987bf9b10cb",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Workflow",
    "icon": "IconSettingsAutomation",
    "shortLabel": "See Workflow"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b94ca303-31ef-4196-adfb-3c30e8b4c1f7",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "USE_AS_DRAFT_WORKFLOW_VERSION",
    "position": 39,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "7bf58db2-b61d-5a32-bede-c2e272e38840",
          "value": "\"DRAFT\"",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "status"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e594e2c1-4935-43a6-ba6e-3987bf9b10cb",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Use as Draft",
    "icon": "IconPencil",
    "shortLabel": "Use as Draft"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "ded40838-9ca9-453e-8c82-2bd83e257d1c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEE_VERSIONS_WORKFLOW_VERSION",
    "position": 40,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a20750ba-20b5-554b-ac64-ead1a7832009",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "workflow"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e594e2c1-4935-43a6-ba6e-3987bf9b10cb",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "See Versions History",
    "icon": "IconVersions",
    "shortLabel": "See Versions"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "ddb7d278-cfe1-4a1b-87b4-5b8d9d35c25e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEARCH_RECORDS",
    "position": 41,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "/"
    ],
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Search",
    "icon": "IconSearch",
    "shortLabel": "Search"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2acf9d18-37e2-45ee-9030-e8d4185b8db3",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEARCH_RECORDS_FALLBACK",
    "position": 42,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "/"
    ],
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "FALLBACK",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Search",
    "icon": "IconSearch",
    "shortLabel": "Search"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "95c5c96b-98d4-4dab-b2b0-c5e2ee37069e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ASK_AI",
    "position": 43,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "@"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "8c8038fe-f9ab-5125-930d-12b91e10a432",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "5a5c8642-bfa6-5c21-8693-1673f91621ba",
          "value": "false",
          "operand": "IS",
          "contextKey": "isInSidePanel"
        },
        {
          "id": "d171285a-a7e7-5a0f-ba45-ea065731034d",
          "value": "[\"agentChatThread\"]",
          "operand": "IS_NOT",
          "contextKey": "objectMetadataItem",
          "subFieldName": "nameSingular"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Ask AI",
    "icon": "IconMessageCirclePlus",
    "shortLabel": null
  },
  {
    "__typename": "CommandMenuItem",
    "id": "d1f45c8c-a9e5-492f-bc4f-106c01a4d878",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NEW_AI_CHAT",
    "position": 43,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "2fe41a90-5ae0-5504-8e4c-88534edaffba",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "e145f445-d158-5ca5-9c17-a0ba6cf79411",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "0820a15c-c7f6-53fa-8e6e-d99c1b8514b6",
          "value": "false",
          "operand": "IS",
          "contextKey": "isInSidePanel"
        },
        {
          "id": "8a68cf72-ea43-51e0-a9e3-cd6da1835330",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "New chat",
    "icon": "IconMessageCirclePlus",
    "shortLabel": "New chat"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "4d0dc2bb-068c-4a3e-b875-d8cf0ef182bf",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "VIEW_PREVIOUS_AI_CHATS",
    "position": 44,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "afc05440-4386-5b1b-84ad-c381d7b587c0",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "View Previous AI Chats",
    "icon": "IconHistory",
    "shortLabel": "Previous AI Chats"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "92f08430-bcd6-4ebe-90d7-794d64d122ea",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "REPLY_TO_EMAIL_THREAD",
    "position": 45,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "7cfa5a0c-74b8-5a51-86c7-30569681ac76",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "d0de087f-e2c0-4a05-9eee-9675f9dd3738",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Reply",
    "icon": "IconArrowBackUp",
    "shortLabel": "Reply"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "35d940e6-c2de-45b8-9fce-d81c57ba415a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_EMAIL",
    "position": 46,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "f70ffa4a-c8e1-5c1e-97b8-d13848cc9be4",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "SEND_EMAIL_TOOL"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Compose Email",
    "icon": "IconMail",
    "shortLabel": "Compose"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "826c0daa-a972-4ac9-9e19-9ccf78a91e91",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 47,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/profile"
    },
    "hotKeys": [
      "G",
      "S"
    ],
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Settings",
    "icon": "IconSettings",
    "shortLabel": "Settings"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2382467b-35d1-4a17-8098-d5fb4ad0c3b4",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 48,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/experience"
    },
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Experience Settings",
    "icon": "IconColorSwatch",
    "shortLabel": "Experience"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "e1bbf3ee-2d49-4792-b9e0-19eb5a31fb55",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 49,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/accounts"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "90b8a995-600a-5ef5-b7ec-c6608be8b792",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "CONNECTED_ACCOUNTS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Accounts Settings",
    "icon": "IconAt",
    "shortLabel": "Accounts"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b0072181-bcdc-4d19-9c50-6772c269a0e6",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 50,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/accounts/emails"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "90b8a995-600a-5ef5-b7ec-c6608be8b792",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "CONNECTED_ACCOUNTS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Emails Settings",
    "icon": "IconMail",
    "shortLabel": "Emails"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "a308024d-9243-484e-b088-44cb9ab5d7f8",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 51,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/accounts/calendars"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "90b8a995-600a-5ef5-b7ec-c6608be8b792",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "CONNECTED_ACCOUNTS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Calendars Settings",
    "icon": "IconCalendarEvent",
    "shortLabel": "Calendars"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "60f20b75-e3e6-4abd-ad8d-06ddd95bbd81",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 52,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/general"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "4d702d95-51fe-52e2-9f09-cd515d314f15",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to General Settings",
    "icon": "IconSettings",
    "shortLabel": "General"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "dc0f730a-9099-4232-8379-bd0988a6cb7c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 53,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/objects"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "d598aef4-3086-58ff-a69a-7330e5489f95",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "DATA_MODEL"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Data Model Settings",
    "icon": "IconHierarchy",
    "shortLabel": "Data Model"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "960e1c8a-2b62-465a-bafb-3cf5d2d5982a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 54,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/members"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c8766b81-74eb-5453-8ff8-8700ec50fba5",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE_MEMBERS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Members Settings",
    "icon": "IconUsers",
    "shortLabel": "Members"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7476598f-a1bf-4ba7-836d-8b2770145b39",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 55,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/members#roles"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c8766b81-74eb-5453-8ff8-8700ec50fba5",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE_MEMBERS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Roles Settings",
    "icon": "IconLock",
    "shortLabel": "Roles"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "dfbd55ae-e0fa-4766-a3eb-f3044d4d83fa",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 56,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/domains"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "4d702d95-51fe-52e2-9f09-cd515d314f15",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Domains Settings",
    "icon": "IconWorld",
    "shortLabel": "Domains"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "54c47890-7221-45b3-a34f-e1d74e682db2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 57,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/billing"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "4d702d95-51fe-52e2-9f09-cd515d314f15",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Billing Settings",
    "icon": "IconCreditCard",
    "shortLabel": "Billing"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "33f9512d-68e2-42b4-b647-35029f068388",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 58,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/developers"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "38f3959c-0e1c-5e32-83b9-38569107506a",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "API_KEYS_AND_WEBHOOKS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Developers Settings",
    "icon": "IconCode",
    "shortLabel": "Developers"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3dcd0951-2f56-4dff-af2c-0b2f4ae1135a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 59,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/applications"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "cbc7f5a3-3dd7-558b-a526-21f8af5c1417",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "APPLICATIONS"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Apps Settings",
    "icon": "IconApps",
    "shortLabel": "Apps"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "f7b393ab-3345-4349-95bd-9b3cbd8e9aaf",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 60,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/ai"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "4d702d95-51fe-52e2-9f09-cd515d314f15",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "WORKSPACE"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to AI Settings",
    "icon": "IconSparkles",
    "shortLabel": "AI"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "87662aca-bb78-4a3f-aaf4-35578a2069d2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 61,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/security"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "ab2a5cc1-0c77-532b-bf4b-f5c71b37fe20",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "SECURITY"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Security Settings",
    "icon": "IconKey",
    "shortLabel": "Security"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2bdade01-79c1-44b9-a1ae-18e6a117d51e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 62,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/admin-panel"
    },
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "63576a44-9e7b-5692-af6a-cf150de0cc7b",
          "value": "true",
          "operand": "IS",
          "contextKey": "canImpersonate",
          "recordFilterGroupId": "a924bc67-6040-5706-8b18-db403f8244a3",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "ce980b89-0eed-5df8-8c51-78f477f9e11c",
          "value": "true",
          "operand": "IS",
          "contextKey": "canAccessFullAdminPanel",
          "recordFilterGroupId": "a924bc67-6040-5706-8b18-db403f8244a3",
          "positionInRecordFilterGroup": 1
        }
      ],
      "recordFilterGroups": [
        {
          "id": "a924bc67-6040-5706-8b18-db403f8244a3",
          "logicalOperator": "OR"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Admin Panel Settings",
    "icon": "IconServer",
    "shortLabel": "Admin Panel"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "07d608d5-092b-4fca-9c30-8739f353cba2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 63,
    "isPinned": false,
    "payload": {
      "__typename": "PathCommandMenuItemPayload",
      "path": "/settings/community"
    },
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Community Settings",
    "icon": "IconUsers",
    "shortLabel": "Community"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "73486cc0-9ea7-44e4-adbf-3ae354379941",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_EMAIL",
    "position": 64,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "e3ea29ce-14f5-535d-a8bb-f85b402a71a6",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "a5cf9cc4-6593-50df-83bb-99eea4d6c1a2",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "SEND_EMAIL_TOOL"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "be84f510-e44f-45f8-baa7-63ed01fb2d0a",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Send Email",
    "icon": "IconMail",
    "shortLabel": "Send Email"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "d6247862-af66-412d-90ae-05b84d1c0891",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_EMAIL",
    "position": 65,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c1118103-8053-5718-9aba-15b206f1717d",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "e88ccd1a-7795-569f-abbb-9baf1e013b87",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "SEND_EMAIL_TOOL"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "adefdff4-168f-4968-926e-1728b87b527b",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Send Email",
    "icon": "IconMail",
    "shortLabel": "Send Email"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2f4a02b4-8312-4d99-aff8-54dc2aa8f3c4",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_CAMPAIGN",
    "position": 66,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailabilityExpression": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Compose Campaign",
    "icon": "IconSend",
    "shortLabel": "Campaign"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c93efd9e-9742-4a6c-b604-119ddefc1716",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_EMAIL",
    "position": 66,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c1118103-8053-5718-9aba-15b206f1717d",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "e88ccd1a-7795-569f-abbb-9baf1e013b87",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "SEND_EMAIL_TOOL"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "1e504af1-5e0d-423b-ad2f-a2fde63a9a9f",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Send Email",
    "icon": "IconMail",
    "shortLabel": "Send Email"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3a48a699-f32a-45b6-83ec-1070133b3146",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "COMPOSE_CAMPAIGN",
    "position": 67,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailabilityExpression": "pageType == \"INDEX_PAGE\"",
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Create Campaign",
    "icon": "IconPlus",
    "shortLabel": "Create"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "f9bbec56-88e8-4c01-81c4-08d7d0d36657",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEND_MESSAGE_CAMPAIGN",
    "position": 68,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "2d6d6676-b7cd-52d7-bf07-3a43d701b71e",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "f25fdca3-f2f7-5002-9c52-af45f8cf38f6",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "e6f48734-ac9b-50d3-855d-38125452b0ee",
          "value": "\"SCHEDULED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "f73b1c19-79db-5f61-b704-2fe6d6f93c4d",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "8bfe2a18-d62c-5756-9da2-7047890a20fa",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 3
        }
      ],
      "recordFilterGroups": [
        {
          "id": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "logicalOperator": "AND"
        },
        {
          "id": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 1
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Send Campaign",
    "icon": "IconSend",
    "shortLabel": "Send"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2f02cd70-41fe-4e95-abea-70fdc6e16f21",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SEND_MESSAGE_CAMPAIGN_TEST",
    "position": 69,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "2d6d6676-b7cd-52d7-bf07-3a43d701b71e",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "f25fdca3-f2f7-5002-9c52-af45f8cf38f6",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "e6f48734-ac9b-50d3-855d-38125452b0ee",
          "value": "\"SCHEDULED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "f73b1c19-79db-5f61-b704-2fe6d6f93c4d",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "8bfe2a18-d62c-5756-9da2-7047890a20fa",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED",
          "recordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 3
        }
      ],
      "recordFilterGroups": [
        {
          "id": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "logicalOperator": "AND"
        },
        {
          "id": "a51f17cb-3062-5e67-963e-d9722b2892c6",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "1bbb73a2-2119-527d-a93a-14cda42a176c",
          "positionInRecordFilterGroup": 1
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Send Test Email",
    "icon": "IconMail",
    "shortLabel": "Test"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "5dcd61bb-5546-47de-b81c-9af7f7d0cc79",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EMAIL_BLOCK_SETTINGS",
    "position": 70,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "89cf8b80-4186-549d-a89f-94871f172f76",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "3582f223-88c5-5711-9ca3-f74540eb30d1",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "a14fc14d-3c96-5ca7-8ec8-7483fc4015e7",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status"
        },
        {
          "id": "061cc873-5732-57d0-9226-fd6bb0754180",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Add Block",
    "icon": "IconPlus",
    "shortLabel": "Add Block"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "31c565c4-85ef-4359-a32f-76472f32feb2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "EMAIL_PAGE_STYLE",
    "position": 70.5,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "89cf8b80-4186-549d-a89f-94871f172f76",
          "value": "[\"RECORD_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "3582f223-88c5-5711-9ca3-f74540eb30d1",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "a14fc14d-3c96-5ca7-8ec8-7483fc4015e7",
          "value": "\"DRAFT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status"
        },
        {
          "id": "061cc873-5732-57d0-9226-fd6bb0754180",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Email Style",
    "icon": "IconPaint",
    "shortLabel": "Email Style"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "da6f2180-c0f5-413a-a6b3-f2b5816ab784",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "CANCEL_MESSAGE_CAMPAIGN",
    "position": 71,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "f0d63789-4165-5586-adeb-7dc609a7718b",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "0b659048-6620-5e09-9051-f50d663af812",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "417eaab6-2479-58bd-852d-0d2ab11c3520",
          "value": "\"SCHEDULED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "711c2f85-1ffa-5bdc-bc35-acebd674ba6e",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "4e88fc4b-c418-5337-a91c-3142851282ad",
          "value": "\"SENDING\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status",
          "recordFilterGroupId": "711c2f85-1ffa-5bdc-bc35-acebd674ba6e",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "cec9b0e9-93ef-5781-883f-bd9fac3770b9",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "0b659048-6620-5e09-9051-f50d663af812",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "4498706e-36a8-5f51-9ebd-4ad7f7a27d6e",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED",
          "recordFilterGroupId": "0b659048-6620-5e09-9051-f50d663af812",
          "positionInRecordFilterGroup": 3
        }
      ],
      "recordFilterGroups": [
        {
          "id": "0b659048-6620-5e09-9051-f50d663af812",
          "logicalOperator": "AND"
        },
        {
          "id": "711c2f85-1ffa-5bdc-bc35-acebd674ba6e",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "0b659048-6620-5e09-9051-f50d663af812",
          "positionInRecordFilterGroup": 1
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Cancel Campaign",
    "icon": "IconX",
    "shortLabel": "Cancel"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7f962b43-63d2-4278-9f43-2516fa69d121",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DUPLICATE_MESSAGE_LIST",
    "position": 71,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "547f09eb-2c05-5d9a-8d59-6ec4743c4618",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED"
        },
        {
          "id": "8576eaa4-2677-54a0-a00c-836297e3f200",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "1ffffb16-fa99-5633-a6e2-7a67b99a3aeb",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "d6da45c6-1aa5-529a-9153-1c23cac94b19",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "a171da75-725f-4f48-a39d-14750c39937f",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Duplicate List",
    "icon": "IconCopyPlus",
    "shortLabel": "Duplicate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "a50e3ff5-491f-40cc-9360-f0eed7d48259",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "DUPLICATE_MESSAGE_CAMPAIGN",
    "position": 72,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "280426ee-70b0-5dea-9cce-fa91cc949a5c",
          "value": "1",
          "operand": "IS",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "4af02240-77b8-5d11-8830-4d31ce3de80d",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "08411a54-4106-598e-9e7b-35d6534ac162",
          "value": "true",
          "operand": "IS",
          "contextKey": "objectPermissions",
          "subFieldName": "canUpdateObjectRecords"
        },
        {
          "id": "00c9b7ca-f09a-5505-83ea-cc31e8310054",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED"
        }
      ]
    },
    "conditionalPinned": {
      "recordFilters": [
        {
          "id": "bf375b02-e2c9-565c-b5a1-bac15ed6b5ba",
          "value": "\"SENT\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "status"
        }
      ]
    },
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Duplicate Campaign",
    "icon": "IconCopy",
    "shortLabel": "Duplicate"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c926aa17-b0a0-4998-9183-d0370bcfe9e6",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "MARK_AI_CHAT_AS_READ",
    "position": 73,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "95c54f55-a47c-5ecb-b708-7e761a48285d",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "04460dda-5d50-533e-8e1b-a6987c27fbee",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "88a7bbb3-bec3-52b5-8988-f94acd0ba827",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "e0118054-2527-5856-b312-b7b583f820a1",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "404803b8-b72d-56b9-9f11-f41c542b7d31",
          "value": "true",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.isUnread"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Mark as read",
    "icon": "IconEye",
    "shortLabel": "Mark as read"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "539046ee-b5d0-45cc-99bd-6c844a555687",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ADD_TO_MESSAGE_LIST",
    "position": 73,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "ea8e0fd5-65b6-52a5-938a-29080e8f19f7",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED",
          "recordFilterGroupId": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "421151f1-2169-5b0b-ad40-5398bbb93cdd",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectWritePermissions",
          "subFieldName": "messageListMember",
          "recordFilterGroupId": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "positionInRecordFilterGroup": 1
        },
        {
          "id": "8a7355bc-b09b-5e00-9377-2be349c356ea",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords",
          "recordFilterGroupId": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "positionInRecordFilterGroup": 2
        },
        {
          "id": "032bfda5-b451-515b-b853-161ed2a7fc4c",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView",
          "recordFilterGroupId": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "positionInRecordFilterGroup": 3
        },
        {
          "id": "9dc04039-6ac7-5387-93b8-6cef5373315e",
          "value": "true",
          "operand": "IS",
          "contextKey": "isSelectAll",
          "recordFilterGroupId": "db6a3e5f-dceb-5023-adee-c849abed581d",
          "positionInRecordFilterGroup": 0
        },
        {
          "id": "52e5e8b8-ac2f-5c0e-b5f9-2c14182f887c",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt",
          "recordFilterGroupId": "db6a3e5f-dceb-5023-adee-c849abed581d",
          "positionInRecordFilterGroup": 1
        }
      ],
      "recordFilterGroups": [
        {
          "id": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "logicalOperator": "AND"
        },
        {
          "id": "db6a3e5f-dceb-5023-adee-c849abed581d",
          "logicalOperator": "OR",
          "parentRecordFilterGroupId": "82a70b34-22cf-588e-81ac-308fb9e1ae15",
          "positionInRecordFilterGroup": 4
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "be84f510-e44f-45f8-baa7-63ed01fb2d0a",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Add to List",
    "icon": "IconUserPlus",
    "shortLabel": "Add to List"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "350b86fa-40b5-4b4e-ae21-f6e025c72fb2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "MARK_AI_CHAT_AS_UNREAD",
    "position": 74,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "853773b0-abb4-55ae-acb4-d000901e0b30",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "5ff8a8c7-29f4-5965-96d2-bc2d2956edc2",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "1df8422b-a332-508c-bfa5-abd265c95dcd",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "fee08ec1-02e1-5dd6-bf5b-04357930e8b9",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "f27755b6-8d85-51ec-8c94-f7ddb7a8632d",
          "value": "false",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.isUnread"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Mark as unread",
    "icon": "IconEyeOff",
    "shortLabel": "Mark as unread"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c906d636-8511-42ec-aa38-30e895b1b774",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ADD_VIEW_TO_MESSAGE_LIST",
    "position": 74,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "20bd1c07-7316-562b-861d-86140687112d",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED"
        },
        {
          "id": "8044fe14-d89d-555f-b386-f1acbba94657",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectWritePermissions",
          "subFieldName": "messageListMember"
        },
        {
          "id": "48a3a213-04f3-5beb-bae0-09d365061cd2",
          "value": "[\"INDEX_PAGE\"]",
          "operand": "IS",
          "contextKey": "pageType"
        },
        {
          "id": "d2ce424d-659c-59cb-94a5-f123820c96eb",
          "value": "false",
          "operand": "IS",
          "contextKey": "hasAnySoftDeleteFilterOnView"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL_OBJECT_CONTEXT",
    "availabilityObjectMetadataId": "be84f510-e44f-45f8-baa7-63ed01fb2d0a",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Add View to List",
    "icon": "IconUserPlus",
    "shortLabel": "Add to List"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "1329a0e1-d4f1-42bb-8acc-b07a7bc59c16",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "MARK_AI_CHAT_AS_DONE",
    "position": 75,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "E"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a92fb117-91e4-5fb6-8c7f-7fad51b884ad",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "7aa16418-e41b-5e96-b420-292f6472d4e3",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "d9d800e0-c6fe-538c-bf6e-dc459519e967",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "53649bf4-40e2-5fc4-a103-f6f7f0e12393",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "bdeb7b6e-75b2-5576-b138-dabc8fd864f1",
          "value": "\"INBOX\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.scope"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Mark as done",
    "icon": "IconCheck",
    "shortLabel": "Done"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "8b8199dc-2c9b-4f37-adfc-46ff6420f7b9",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "REOPEN_AI_CHAT",
    "position": 76,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "E"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "1da37393-2127-532d-8860-330d439b3d3e",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "41a63404-74fb-5279-b624-fb529c0fd691",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "033d4163-6129-55bd-90a7-782d75216cbe",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "a567793e-b7da-5f1c-bc04-a41ca9e195d7",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "89431652-9eef-5c52-8bf2-b5f84e9cfb3b",
          "value": "\"ARCHIVED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.scope"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Reopen",
    "icon": "IconCircleDashed",
    "shortLabel": "Reopen"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2c3917fd-1d20-459c-a097-f031e9a229cb",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "REOPEN_AI_CHAT",
    "position": 76,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "E"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "64404efc-bad2-5f59-a921-4987ad45f293",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "c56cc21f-12b1-50d3-a365-d1be50177489",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "698b8f3a-6607-57dc-b929-b182f610dff9",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "1c152a38-8fd4-585c-92ff-b321787c5be2",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "357724c2-c26f-5c14-b04c-3a358582a265",
          "value": "\"SNOOZED\"",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.scope"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Unsnooze",
    "icon": "IconZzzOff",
    "shortLabel": "Unsnooze"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "ad9b9df2-4536-4387-86c5-7127b7981938",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SNOOZE_AI_CHAT",
    "position": 77,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "H"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "007c20f6-4678-5a75-bd2e-5c7705e6fee9",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "ab52d416-890a-589a-9612-0fa3896e198f",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "1ad96fa6-6f09-5aa1-8a24-b1ad8b60b303",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "5e0b2718-1826-594c-86f4-becf51cb2f37",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "b932f9eb-f0ac-5605-a0c7-3c5b6b963b10",
          "operand": "IS_NOT_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus"
        },
        {
          "id": "0c4ca071-0f22-50a5-aef1-6c6f4defe1cd",
          "value": "\"SNOOZED\"",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.scope"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Snooze",
    "icon": "IconZzz",
    "shortLabel": "Snooze"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "8c015eaf-4ddb-4eae-b09b-fa8e1e43d0a1",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "SUBSCRIBE_TO_AI_CHAT",
    "position": 78,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "12928afd-d09a-5e3a-b4da-9a97de16e9e5",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "962be05b-0f4a-5103-b6e5-9d44210b5fda",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "e1418927-b741-5fe6-a386-3972882e51fa",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "58b7fb02-b5c5-5021-b2df-94797e2d57ae",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "d9afff0a-4de0-5b59-a7c2-8755a0cbc5c3",
          "value": "false",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.isSubscribed"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Subscribe",
    "icon": "IconBell",
    "shortLabel": "Subscribe"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "11b0a26c-bd1b-4a04-a69e-9637a6e1370c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "UNSUBSCRIBE_FROM_AI_CHAT",
    "position": 79,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a99ca67f-d1bb-5314-8cdd-cd1138be03c7",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "435b6a21-4518-55a8-bc71-d1fff4cf4cf1",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "8a703288-177d-530c-af40-cff7de736908",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "c0fd757e-aa15-59a6-b95b-a4ea749dbf91",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "fc36ec99-42a0-5d87-8063-c57956477a80",
          "value": "true",
          "operand": "IS",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.isSubscribed"
        },
        {
          "id": "fa89b8a6-cb63-5009-954b-18859e78d63c",
          "value": "true",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "inboxStatus.isAssignedToMe"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Unsubscribe",
    "icon": "IconBellOff",
    "shortLabel": "Unsubscribe"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "8c8a1528-6f3f-44fa-b156-8b9dc1572d83",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "ASSIGN_AI_CHAT",
    "position": 80,
    "isPinned": true,
    "payload": null,
    "hotKeys": [
      "A"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "60df2fd6-92e3-557b-b396-a7b74c41ac13",
          "value": "1",
          "operand": "GREATER_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        },
        {
          "id": "44de86df-252d-5ef1-a0aa-7590524a4c2b",
          "value": "true",
          "operand": "IS",
          "contextKey": "permissionFlags",
          "subFieldName": "AI"
        },
        {
          "id": "5632450a-3dd6-51f2-95d0-1d847c5421bd",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_AI_CHAT_INBOX_ENABLED"
        },
        {
          "id": "878d42ea-aa23-519a-bd01-faedf66d3f76",
          "operand": "IS_EMPTY",
          "contextKey": "selectedRecords",
          "subFieldName": "deletedAt"
        },
        {
          "id": "af10ecb8-9136-5f29-a86d-aaaec0b64205",
          "value": "false",
          "operand": "IS_NOT",
          "contextKey": "selectedRecords",
          "subFieldName": "recordPermissions.canUpdate"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "RECORD_SELECTION",
    "availabilityObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Assign",
    "icon": "IconUsers",
    "shortLabel": "Assign"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "4f95b0bb-79e4-4333-b6d7-6c6fc36b30b6",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 81,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "G",
      "C"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "4a77411e-5aec-507b-8243-ca5c1da9d1bc",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "company"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "adefdff4-168f-4968-926e-1728b87b527b",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Companies",
    "icon": "IconBuildingSkyscraper",
    "shortLabel": "Companies"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "aef9852f-34e4-4e1c-8949-72c3df0ec11b",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 82,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "G",
      "D"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "5cd17348-ee9f-53ea-b346-a12d94da25ae",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "dashboard"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "74bb8fe8-a9ce-4f64-baf5-77e9c2252920",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Dashboards",
    "icon": "IconLayoutDashboard",
    "shortLabel": "Dashboards"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "ebe45c8d-801d-4baa-962f-511f2aaafe74",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 83,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "G",
      "N"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "be9268d7-0193-58ad-b6ee-69c636290192",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "note"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "1c28ab0b-d050-4027-87d6-5d7f0bd021db",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Notes",
    "icon": "IconNotes",
    "shortLabel": "Notes"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "da3e027e-c34f-492c-b40d-6031b61986cb",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 84,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailabilityExpression": "targetObjectReadPermissions.messageCampaign",
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "1e504af1-5e0d-423b-ad2f-a2fde63a9a9f",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Opportunities",
    "icon": "IconTargetArrow",
    "shortLabel": "Opportunities"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "218dc751-58e0-4397-8c0e-29f0e08b7c4e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 85,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailabilityExpression": "targetObjectReadPermissions.messageList",
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "be84f510-e44f-45f8-baa7-63ed01fb2d0a",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to People",
    "icon": "IconUser",
    "shortLabel": "People"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "5787f414-30c2-40b0-862f-91337cc7d785",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 86,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "G",
      "T"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "8041b350-3d9f-578b-bcbc-94184d95fce0",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "task"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "41946725-278c-4d7a-9ad7-a80e54a8bf06",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Tasks",
    "icon": "IconCheckbox",
    "shortLabel": "Tasks"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "52b1da4d-4402-432f-a21a-5ac69fa32b32",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 87,
    "isPinned": false,
    "payload": null,
    "hotKeys": [
      "G",
      "W"
    ],
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "55889e11-f025-58e1-b81d-aae2c2ca9d25",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "workflow"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "07e6f32f-ba56-42c3-a346-33f84ddb882b",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Workflows",
    "icon": "IconSettingsAutomation",
    "shortLabel": "Workflows"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "5ad1d3cd-af84-4c60-b4b5-6c6e3612cc0c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 88,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "fd0318f5-a4b2-5e4a-9455-e8fb33ff1eb1",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "agentChatThread"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "cb7d59bc-4937-4fd8-9e75-64c3de0915d7",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Chats",
    "icon": "IconMessage",
    "shortLabel": "Chats"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "26bfef05-5886-4bed-b966-02ac36b865d1",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 89,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "7ef6f674-fb90-5b33-a381-a117e6af0f32",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "agentChatThreadTarget"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "0b26dcde-aadb-47c2-ad2b-bb05cc7291f7",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Agent chat thread targets",
    "icon": "IconMessage",
    "shortLabel": "Agent chat thread targets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c78f4567-0c04-4328-8bea-e4aa1521d98b",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 90,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "baf7aed7-0788-50ab-9ea0-37bc7a09787f",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "agentChatThreadParticipant"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "60126562-d537-44e6-9302-67643ff22a8f",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Chat thread participants",
    "icon": "IconMessage",
    "shortLabel": "Chat thread participants"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "6507d313-b1ed-40de-94ca-a68010a1471e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 91,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "cadcbe77-1057-503f-9aff-39d39bd624a7",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "attachment"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "28dc632b-7472-4f83-90da-89fa0f7e6b1d",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Attachments",
    "icon": "IconFileImport",
    "shortLabel": "Attachments"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b29cdffd-4093-40e0-bccf-94420297a17a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 92,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "e8666adb-b46a-5f51-8d6f-80008cde1f94",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "blocklist"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "72754525-a222-4abc-b4ff-8ac3d4b82273",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Blocklists",
    "icon": "IconForbid2",
    "shortLabel": "Blocklists"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "cebaaa90-9aaf-4bac-93e0-e8df363888a5",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 93,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "14b3544b-9b4e-546b-b287-4d30ce9ed050",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "calendarChannelEventAssociation"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "420b4179-4259-4bf5-ac77-e540230ba0dc",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Calendar Channel Event Associations",
    "icon": "IconCalendar",
    "shortLabel": "Calendar Channel Event Associations"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b0b6222a-cabc-49fc-afaa-413450d35ffe",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 94,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "b761b556-f45c-5b34-b283-bbb351fa4a69",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "calendarEventParticipant"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "16c28e08-63af-45ee-b1e7-b499530740f1",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Calendar event participants",
    "icon": "IconCalendar",
    "shortLabel": "Calendar event participants"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "f352d866-542a-4c40-a357-fb9397180d0b",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 95,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "3e37fee4-95fd-5350-99a0-428a640f0f76",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "calendarEvent"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "d9e8e682-38a2-433c-a7a3-d17ecf0dc9a5",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Calendar events",
    "icon": "IconCalendar",
    "shortLabel": "Calendar events"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "54cd11dd-e051-4f23-9d48-4d136d51ea2e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 96,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "e2f3cd8a-6bf4-58b5-8f16-8e8e0d3c187a",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "calendarEventTarget"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "29466313-e38b-4ab2-a411-a2b535c8746b",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Calendar Event Targets",
    "icon": "IconCalendar",
    "shortLabel": "Calendar Event Targets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "4cd3f0d2-0844-4564-81ca-75eccfc1911c",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 97,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a1075c97-1b68-5fb4-8d11-d19880e08c83",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "callRecording"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "8be97e28-a1de-45b1-b7c8-df1d63523689",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Call Recordings",
    "icon": "IconVideo",
    "shortLabel": "Call Recordings"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "93169cb1-d548-4380-b678-8976926ea259",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 98,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "7d0dcaaa-d7cd-5218-b86b-83857127d259",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED"
        },
        {
          "id": "c540186c-8bce-563a-89aa-ab23d306683e",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageCampaign"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "e5c52c5f-caa7-4e0c-9148-66c792e129a8",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Campaigns",
    "icon": "IconSend",
    "shortLabel": "Campaigns"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "c2aba4b0-b7de-451e-b595-e4339bdb9c14",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 99,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c80cbbf1-3062-52bd-9b84-d06bf0d3e87f",
          "value": "true",
          "operand": "IS",
          "contextKey": "featureFlags",
          "subFieldName": "IS_MESSAGE_CAMPAIGN_ENABLED"
        },
        {
          "id": "ca3dba9d-a76c-5a57-91bf-e682fa095d8d",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageList"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "a171da75-725f-4f48-a39d-14750c39937f",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Lists",
    "icon": "IconUsersGroup",
    "shortLabel": "Lists"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "76a5911a-0fd0-408a-a11e-a18ef11c8ce2",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "TRIGGER_WORKFLOW_VERSION",
    "position": 100,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Quick Lead",
    "icon": "IconUserPlus",
    "shortLabel": "Quick Lead"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "58334d20-9cb3-4d7e-8a25-d825545f0982",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 100,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "a015120b-7b48-5c41-8a67-9b17ee929b0c",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageListMember"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "47e54e40-6940-40ca-bcaa-c3540ef1d997",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to List Members",
    "icon": "IconUser",
    "shortLabel": "List Members"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "6d27c378-93ce-4a44-a277-85b50a689491",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 101,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "6e53bcbd-4a0b-5d59-a8ce-8540042a2eff",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageChannelMessageAssociation"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "72637dfd-916d-48fc-85bc-c987de0e8a6c",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Message Channel Message Associations",
    "icon": "IconMessage",
    "shortLabel": "Message Channel Message Associations"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3324c7a5-c9fa-4a97-b3da-b6e910556d2e",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 102,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "c380e7bb-ae2b-5667-b788-e9d63df1edcc",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageChannelMessageAssociationMessageFolder"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "94489aaa-f218-4fcb-8bec-baed85ddc657",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Message Channel Message Association Message Folders",
    "icon": "IconFolder",
    "shortLabel": "Message Channel Message Association Message Folders"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7f3e0716-3a11-448b-8b2d-46ab3e4b82c5",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 103,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "2871b874-ffdd-5f5e-9a61-57baeb28431e",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageParticipant"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "41f07cc6-9f28-428c-bccd-82dc808e9f98",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Message Participants",
    "icon": "IconUserCircle",
    "shortLabel": "Message Participants"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "401086d9-f3c9-40ea-b391-56426426e884",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 104,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "37cbf050-4808-59ac-bf22-85e2273b7737",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageThread"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "d0de087f-e2c0-4a05-9eee-9675f9dd3738",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Message Threads",
    "icon": "IconMessage",
    "shortLabel": "Message Threads"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "cdd2ff9f-f2d4-4e33-b241-9944778e4202",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 105,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "e28df023-3122-571b-bd80-5506c8ced2f0",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "messageThreadTarget"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "aff510be-a0d2-4b4c-8201-5c81ce4c13cc",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Message Thread Targets",
    "icon": "IconMessage",
    "shortLabel": "Message Thread Targets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7b8e9373-34fb-40f8-84c6-ff1f3ae28302",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 106,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "bd0d1ff9-0cce-5143-a0f5-bae26fe534f6",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "message"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "4856e8e4-2c98-454f-b080-0775cd379bfa",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Messages",
    "icon": "IconMessage",
    "shortLabel": "Messages"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "2e637e7c-269b-40a7-b03a-729f0326839d",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 107,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "8c20a6cf-6d54-5de8-b959-0d4ecad3f177",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "noteTarget"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "dd79e8fd-5f0f-4f28-928c-7d1bf69647b4",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Note Targets",
    "icon": "IconCheckbox",
    "shortLabel": "Note Targets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "a610930c-0787-49b3-839c-9fbbaa0bd43a",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 108,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "60d8e8c9-fb7e-53e8-bf3d-e4cc5e93391e",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "taskTarget"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "28890ae5-baed-490b-9b70-81f4a0d62ff2",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Task Targets",
    "icon": "IconCheckbox",
    "shortLabel": "Task Targets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "e7aec47e-092e-40e2-bc17-5dcf8014969f",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 109,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "13ceaa93-37bf-5cc0-bec2-f1a415292f08",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "timelineActivity"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "1b0a5937-7b29-4f0e-989b-77af64630f3d",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Timeline Activities",
    "icon": "IconTimelineEvent",
    "shortLabel": "Timeline Activities"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "215b7bb6-1b09-45fe-a2a3-a9fb33106ada",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 110,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "06fc5dce-8743-53ab-9c50-c6541b569959",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "workflowAutomatedTrigger"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "470c9c44-8b3d-4acc-8477-c24aa9038f70",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Workflow Automated Triggers",
    "icon": "IconSettingsAutomation",
    "shortLabel": "Workflow Automated Triggers"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "0da48a51-0357-4e65-bdc9-7fe194d56693",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 111,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "20f9b029-5c4a-5df3-91de-1be7d8c2c0d4",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "workflowRun"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "ccd38f2f-9838-4a63-b3d4-a0de38cd2785",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Workflow Runs",
    "icon": "IconHistoryToggle",
    "shortLabel": "Workflow Runs"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "f69c7b88-cfb8-4c8d-a6bf-f8c4d2c03ef2",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 112,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "0",
          "value": "-1",
          "operand": "LESS_THAN_OR_EQUAL",
          "contextKey": "numberOfSelectedRecords"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "e594e2c1-4935-43a6-ba6e-3987bf9b10cb",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Workflow Versions",
    "icon": "IconVersions",
    "shortLabel": "Workflow Versions"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "8a6e4dbf-ca77-4c64-b355-b6b068d56b7b",
    "applicationId": "f3681004-8b1f-4d8c-94bc-8efef35e0e59",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 113,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "11ec9307-8498-571c-b563-7e2b1f847e9c",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "workspaceMember"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "5fce6460-7468-4f08-b4fd-406229f7af8e",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Workspace Members",
    "icon": "IconUserCircle",
    "shortLabel": "Workspace Members"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "0d53b49c-ecba-4289-979b-f41fce3afffa",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 114,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "5664090b-8695-5e5b-bfad-56228879ffaa",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "rocket"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "8600ece1-0c4e-43b3-a37c-7c7797a5be96",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Rockets",
    "icon": "IconRocket",
    "shortLabel": "Rockets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "fd472b0b-35e9-414d-a42f-4f4aa2b33f1b",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 115,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "45549924-9e56-5270-831a-233b096a127e",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "pet"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "e33d740c-7fe5-4d37-bf26-54345fa5de3d",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Pets",
    "icon": "IconCat",
    "shortLabel": "Pets"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "b94ae5e1-a728-471b-8d3a-6e2a7e146699",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 116,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "529b0a93-028a-5ca3-8b25-b294afbd0057",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "surveyResult"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "3d640350-5edf-43a2-a282-75e8a910a9ff",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Survey results",
    "icon": "IconRulerMeasure",
    "shortLabel": "Survey results"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "7a29f56d-0747-47b9-8729-132200c24d78",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 117,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "20cb72f5-b136-5082-b0d4-3f620681ffaf",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "employmentHistory"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "880c35b9-7d66-4c8b-bf48-1f98ee3681f7",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Employment Histories",
    "icon": "IconBriefcase",
    "shortLabel": "Employment Histories"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "8f8d65e8-5dad-409d-9ccd-2e98dc965f26",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": null,
    "engineComponentKey": "NAVIGATION",
    "position": 118,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": {
      "recordFilters": [
        {
          "id": "ac5780aa-9e3d-52ac-a16b-472d4076e95e",
          "value": "true",
          "operand": "IS",
          "contextKey": "targetObjectReadPermissions",
          "subFieldName": "petCareAgreement"
        }
      ]
    },
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": "4779f388-d585-4b89-9cdb-017749f82542",
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": null,
    "label": "Go to Pet Care Agreements",
    "icon": "IconPaw",
    "shortLabel": "Pet Care Agreements"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "fedd02c6-cdc8-4b1d-8cb0-54b8592e595d",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": "7b051d47-04a2-5995-a5a1-1fb624bcdb4f",
    "engineComponentKey": "FRONT_COMPONENT_RENDERER",
    "position": 200,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": {
      "id": "7b051d47-04a2-5995-a5a1-1fb624bcdb4f",
      "name": "Hello World",
      "isHeadless": false
    },
    "label": "Hello World",
    "icon": "IconAppWindow",
    "shortLabel": "Hello World"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "3b045c1f-36de-4330-b744-5a7cd6e5d284",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": "2cb4ad5c-4c59-57ad-a645-4772f9296265",
    "engineComponentKey": "FRONT_COMPONENT_RENDERER",
    "position": 201,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": {
      "id": "2cb4ad5c-4c59-57ad-a645-4772f9296265",
      "name": "Show Notification",
      "isHeadless": true
    },
    "label": "Show Notification",
    "icon": "IconBell",
    "shortLabel": "Show Notification"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "a639cd1f-c3f9-46bc-b6af-027165c699da",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": "2cb4ad5c-4c59-57ad-a645-4772f9296265",
    "engineComponentKey": "FRONT_COMPONENT_RENDERER",
    "position": 202,
    "isPinned": true,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": "79c58df5-acf4-45d2-b36a-d7ad03c0a88d",
    "isActive": true,
    "frontComponent": {
      "id": "2cb4ad5c-4c59-57ad-a645-4772f9296265",
      "name": "Show Notification",
      "isHeadless": true
    },
    "label": "Show Notification",
    "icon": "IconBell",
    "shortLabel": "Show Notification"
  },
  {
    "__typename": "CommandMenuItem",
    "id": "93178105-915f-4627-af63-73c2ed8d54b4",
    "applicationId": "ec96657d-2c0e-485a-81ab-a80ee31b62fc",
    "workflowVersionId": null,
    "frontComponentId": "9d1f9ca8-1755-538f-bddb-26994d14a9f6",
    "engineComponentKey": "FRONT_COMPONENT_RENDERER",
    "position": 203,
    "isPinned": false,
    "payload": null,
    "hotKeys": null,
    "conditionalAvailability": null,
    "conditionalPinned": null,
    "availabilityType": "GLOBAL",
    "availabilityObjectMetadataId": null,
    "navigationTargetObjectMetadataId": null,
    "pageLayoutId": null,
    "isActive": true,
    "frontComponent": {
      "id": "9d1f9ca8-1755-538f-bddb-26994d14a9f6",
      "name": "List Companies",
      "isHeadless": false
    },
    "label": "List Companies",
    "icon": "IconBuildingSkyscraper",
    "shortLabel": "List Companies"
  }
];
