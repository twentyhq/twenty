import {
	ObjectMetadataItemsQuery
} from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery = {
  __typename: 'Query',
  objects: {
	"__typename": "ObjectConnection",
	"pageInfo": {
		"__typename": "PageInfo",
		"hasNextPage": false,
		"hasPreviousPage": false,
		"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
		"endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
	},
	"edges": [
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "messageChannelMessageAssociation",
				"namePlural": "messageChannelMessageAssociations",
				"labelSingular": "Message Channel Message Association",
				"labelPlural": "Message Channel Message Associations",
				"description": "Message Synced with a Message Channel",
				"icon": "IconMessage",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEw"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a7e6e901-e96b-46fd-8138-4883b8a5107a",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "105bb68b-9422-40cb-9857-7c421a0ef844",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "50f1dba6-68b1-4b91-8d2f-6f8a7dc00899",
								"type": "UUID",
								"name": "messageId",
								"label": "Message Id id (foreign key)",
								"description": "Message Id id foreign key",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ed7b7c8a-84ea-40c2-af56-8b34e4316585",
								"type": "UUID",
								"name": "messageChannelId",
								"label": "Message Channel Id id (foreign key)",
								"description": "Message Channel Id id foreign key",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "57d32dec-d975-4e0d-bcd8-4fb4eaba978d",
								"type": "RELATION",
								"name": "messageThread",
								"label": "Message Thread Id",
								"description": "Message Thread Id",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "8518d75e-58c3-46c2-a111-a43f3987bb5a",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "57d32dec-d975-4e0d-bcd8-4fb4eaba978d",
										"name": "messageThread"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "c89757a5-8251-4b4f-a5ec-8aba89a50a49",
										"name": "messageChannelMessageAssociations"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "8518d75e-58c3-46c2-a111-a43f3987bb5a",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "c89757a5-8251-4b4f-a5ec-8aba89a50a49",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "24f85128-df33-47c7-8126-9bcb65670f76",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0eedf2e2-3b5b-427c-9d6e-b5c3773856d2",
								"type": "TEXT",
								"name": "messageExternalId",
								"label": "Message External Id",
								"description": "Message id from the messaging provider",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e100f9e7-aff5-46ea-bff6-3239a01ea828",
								"type": "RELATION",
								"name": "message",
								"label": "Message Id",
								"description": "Message Id",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "a098dd38-d544-43c2-ad72-eee88fa60b9c",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "e100f9e7-aff5-46ea-bff6-3239a01ea828",
										"name": "message"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "2950341d-338c-46ed-a866-61a5c397e558",
										"name": "messageChannelMessageAssociations"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "a098dd38-d544-43c2-ad72-eee88fa60b9c",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "2950341d-338c-46ed-a866-61a5c397e558",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "message",
										"namePlural": "messages",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4bddaa2a-d49f-414f-919e-d40f936af413",
								"type": "UUID",
								"name": "messageThreadId",
								"label": "Message Thread Id id (foreign key)",
								"description": "Message Thread Id id foreign key",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c279d1a1-b4a2-424a-b61f-cfe986b4b1f0",
								"type": "TEXT",
								"name": "messageThreadExternalId",
								"label": "Thread External Id",
								"description": "Thread id from the messaging provider",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "57b02715-a5e9-42fc-92c2-23d8a4aac792",
								"type": "RELATION",
								"name": "messageChannel",
								"label": "Message Channel Id",
								"description": "Message Channel Id",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "965a3bf0-b43a-4391-a26f-27a1bd30476f",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "57b02715-a5e9-42fc-92c2-23d8a4aac792",
										"name": "messageChannel"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "198509cb-277f-4da0-acde-482cd52cd814",
										"name": "messageChannelMessageAssociations"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "965a3bf0-b43a-4391-a26f-27a1bd30476f",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "198509cb-277f-4da0-acde-482cd52cd814",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "company",
				"namePlural": "companies",
				"labelSingular": "Company",
				"labelPlural": "Companies",
				"description": "A company",
				"icon": "IconBuildingSkyscraper",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": false,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE5"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "661391a1-6655-424b-b1c2-d8b5722aec49",
								"type": "BOOLEAN",
								"name": "idealCustomerProfile",
								"label": "ICP",
								"description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
								"icon": "IconTarget",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": false,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "29f5afd2-b0e3-43b9-bcd1-f9a767192dba",
								"type": "RELATION",
								"name": "people",
								"label": "People",
								"description": "People linked to the company.",
								"icon": "IconUsers",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "2b293dd1-7b1e-4349-b77d-5d1effe53cf7",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "29f5afd2-b0e3-43b9-bcd1-f9a767192dba",
										"name": "people"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "8cfc11ef-201d-4fb6-9cfd-f82a872a3f77",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "2b293dd1-7b1e-4349-b77d-5d1effe53cf7",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "8cfc11ef-201d-4fb6-9cfd-f82a872a3f77",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8fcf63f1-91cd-42c7-bc6d-99f21ab3e9af",
								"type": "RELATION",
								"name": "accountOwner",
								"label": "Account Owner",
								"description": "Your team member responsible for managing the company account",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4d810e79-eae5-4212-984b-8e95632fd07d",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "8fcf63f1-91cd-42c7-bc6d-99f21ab3e9af",
										"name": "accountOwner"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "79edf404-895d-4db5-9c93-140c547d5af9",
										"name": "accountOwnerForCompanies"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "4d810e79-eae5-4212-984b-8e95632fd07d",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "79edf404-895d-4db5-9c93-140c547d5af9",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fb558bde-aad6-4d0b-a4c6-54750c530e5e",
								"type": "RELATION",
								"name": "attachments",
								"label": "Attachments",
								"description": "Attachments linked to the company",
								"icon": "IconFileImport",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "36daf4c7-9fdf-48f3-9baf-a60d290b729c",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "fb558bde-aad6-4d0b-a4c6-54750c530e5e",
										"name": "attachments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "8e9ba278-5293-4e30-9faf-369eb3459790",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "36daf4c7-9fdf-48f3-9baf-a60d290b729c",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "8e9ba278-5293-4e30-9faf-369eb3459790",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "attachment",
										"namePlural": "attachments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e214ccd0-756d-49aa-ba7a-1b7b47ceaa65",
								"type": "RELATION",
								"name": "opportunities",
								"label": "Opportunities",
								"description": "Opportunities linked to the company.",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ab95d4bd-fa78-43b0-ba0b-7414a4bc85f0",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "e214ccd0-756d-49aa-ba7a-1b7b47ceaa65",
										"name": "opportunities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "fd2615ef-8c24-47e6-862c-ed2b0d9eddf4",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "ab95d4bd-fa78-43b0-ba0b-7414a4bc85f0",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "fd2615ef-8c24-47e6-862c-ed2b0d9eddf4",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "245f5a05-4fac-4e17-8a74-abb8113ca6a3",
								"type": "CURRENCY",
								"name": "annualRecurringRevenue",
								"label": "ARR",
								"description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
								"icon": "IconMoneybag",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"amountMicros": null,
									"currencyCode": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8558d1d1-7c48-4222-a41f-acff24ea695b",
								"type": "RELATION",
								"name": "timelineActivities",
								"label": "Timeline Activities",
								"description": "Timeline Activities linked to the company",
								"icon": "IconIconTimelineEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "44825151-f568-4e5b-833a-70093068fb37",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "8558d1d1-7c48-4222-a41f-acff24ea695b",
										"name": "timelineActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "0c27da2b-afde-48bc-90f4-c58c1f6bd1d1",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "44825151-f568-4e5b-833a-70093068fb37",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "0c27da2b-afde-48bc-90f4-c58c1f6bd1d1",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "516f8e21-ffe3-4d1c-814d-996048e8559e",
								"type": "POSITION",
								"name": "position",
								"label": "Position",
								"description": "Company record position",
								"icon": "IconHierarchy2",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "bdff89f8-3731-42f6-acb9-228181e8c99a",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c66e1086-cbcf-46f8-abec-19d141a83a10",
								"type": "NUMBER",
								"name": "employees",
								"label": "Employees",
								"description": "Number of employees in the company",
								"icon": "IconUsers",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f80b2ce2-1836-4533-8c22-08eb8ebaa002",
								"type": "TEXT",
								"name": "address",
								"label": "Address",
								"description": "The company address",
								"icon": "IconMap",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "78363357-09c3-450d-b335-9d9cd219b784",
								"type": "TEXT",
								"name": "name",
								"label": "Name",
								"description": "The company name",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6b97ae7c-9b97-4a8f-885b-7f8ee3122a7d",
								"type": "TEXT",
								"name": "domainName",
								"label": "Domain Name",
								"description": "The company website URL. We use this url to fetch the company icon",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "efaa1ccd-4c1f-4d81-9d30-f93030d32190",
								"type": "RELATION",
								"name": "favorites",
								"label": "Favorites",
								"description": "Favorites linked to the company",
								"icon": "IconHeart",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "b45f0926-607e-418f-9e26-613594f97868",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "efaa1ccd-4c1f-4d81-9d30-f93030d32190",
										"name": "favorites"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "f56c8d42-3894-4ccf-8588-ad97d2a7df0a",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "b45f0926-607e-418f-9e26-613594f97868",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "f56c8d42-3894-4ccf-8588-ad97d2a7df0a",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "favorite",
										"namePlural": "favorites",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dddef9c7-6dc3-492e-b35a-6e2b2e0eb1e6",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c5938b67-e0e5-471b-94eb-32bfc7f8b4c6",
								"type": "RELATION",
								"name": "activityTargets",
								"label": "Activities",
								"description": "Activities tied to the company",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "63a61588-de8c-47ec-b695-da342836625f",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "c5938b67-e0e5-471b-94eb-32bfc7f8b4c6",
										"name": "activityTargets"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "1e7a5c6f-b913-4349-a672-295018c2437c",
										"name": "company"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "63a61588-de8c-47ec-b695-da342836625f",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "1e7a5c6f-b913-4349-a672-295018c2437c",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d85ca4ac-d23a-4a72-8cec-95d1d9de84f5",
								"type": "LINK",
								"name": "xLink",
								"label": "X",
								"description": "The company Twitter/X account",
								"icon": "IconBrandX",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6d35699a-5f7b-44b9-843e-2f6a267a4d90",
								"type": "LINK",
								"name": "linkedinLink",
								"label": "Linkedin",
								"description": "The company Linkedin account",
								"icon": "IconBrandLinkedin",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "688991bc-3bb7-4515-ab65-7b6a85cd791c",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c09e6901-108d-48b4-a854-bd693104cbe5",
								"type": "UUID",
								"name": "accountOwnerId",
								"label": "Account Owner id (foreign key)",
								"description": "Your team member responsible for managing the company account id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "person",
				"namePlural": "people",
				"labelSingular": "Person",
				"labelPlural": "People",
				"description": "A person",
				"icon": "IconUser",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": false,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjI5"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8c2a0d3d-3c52-4ae2-b78a-852b5775b377",
								"type": "ADDRESS",
								"name": "testAddress",
								"label": "Test address",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:32:19.818Z",
								"updatedAt": "2024-06-07T09:32:19.818Z",
								"defaultValue": {
									"addressLat": null,
									"addressLng": null,
									"addressCity": "''",
									"addressState": "''",
									"addressCountry": "''",
									"addressStreet1": "''",
									"addressStreet2": "''",
									"addressPostcode": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d987bd9a-f83b-4238-8260-42511d8f2aba",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "Contact’s company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2df6ebe6-7fc5-4220-b672-881788798001",
								"type": "LINK",
								"name": "xLink",
								"label": "X",
								"description": "Contact’s X/Twitter account",
								"icon": "IconBrandX",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "64564882-8823-4b00-8cc5-2cc6d8cbc23c",
								"type": "FULL_NAME",
								"name": "name",
								"label": "Name",
								"description": "Contact’s name",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"lastName": "''",
									"firstName": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8a0d463e-00b2-4053-b972-a4824a9dfbaf",
								"type": "MULTI_SELECT",
								"name": "testMultiSelect",
								"label": "Test multi select",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:39:20.747Z",
								"updatedAt": "2024-06-07T09:39:20.747Z",
								"defaultValue": null,
								"options": [
									{
										"id": "c39d006a-4bef-4b8d-98ee-29ef7218750f",
										"color": "green",
										"label": "Option 1",
										"value": "OPTION_1",
										"position": 0
									},
									{
										"id": "b7aa0c66-ba2f-434f-80ec-149a9325549f",
										"color": "turquoise",
										"label": "Option 2",
										"value": "OPTION_2",
										"position": 1
									},
									{
										"id": "01b3d48b-3d29-4769-b9ab-b6dd029179ae",
										"color": "sky",
										"label": "Option 3",
										"value": "OPTION_3",
										"position": 2
									},
									{
										"id": "438a6323-d33e-40ea-9ce8-0a6cd2db6ddf",
										"color": "blue",
										"label": "Option 4",
										"value": "OPTION_4",
										"position": 3
									},
									{
										"id": "2d6449fd-7b3a-4c44-8892-7f4a5485ba7f",
										"color": "purple",
										"label": "Option 5",
										"value": "OPTION_5",
										"position": 4
									},
									{
										"id": "78d6cb72-b065-4c9c-b4ee-d63b813bf6c4",
										"color": "pink",
										"label": "Option 6",
										"value": "OPTION_6",
										"position": 5
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7b1e5fbc-1418-4e35-9df2-5f5e3b64a2dd",
								"type": "RELATION",
								"name": "messageParticipants",
								"label": "Message Participants",
								"description": "Message Participants",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "e2296019-f6ef-4bab-aa5e-2cd60b4c886c",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "7b1e5fbc-1418-4e35-9df2-5f5e3b64a2dd",
										"name": "messageParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "392dc86a-75b5-433e-9a1e-ef11e022e975",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "e2296019-f6ef-4bab-aa5e-2cd60b4c886c",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "392dc86a-75b5-433e-9a1e-ef11e022e975",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f75a661f-531f-4df3-a2da-0ffe1c34ac51",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a1f598f7-f449-40e5-84c7-69d31842f683",
								"type": "LINKS",
								"name": "testLinks",
								"label": "Test links",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:32:46.002Z",
								"updatedAt": "2024-06-07T09:37:05.524Z",
								"defaultValue": {
									"primaryLinkUrl": "''",
									"secondaryLinks": null,
									"primaryLinkLabel": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2ab56606-c3b4-451e-a73a-c01c96f35055",
								"type": "TEXT",
								"name": "avatarUrl",
								"label": "Avatar",
								"description": "Contact’s avatar",
								"icon": "IconFileUpload",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dbb954bf-992b-4d62-b492-1dd25226b7e4",
								"type": "DATE",
								"name": "testDate",
								"label": "Test date",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:38:48.913Z",
								"updatedAt": "2024-06-07T09:38:48.913Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "812aea3f-b533-43a1-b8bd-b87aaa84c76e",
								"type": "RELATION",
								"name": "favorites",
								"label": "Favorites",
								"description": "Favorites linked to the contact",
								"icon": "IconHeart",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "313373c0-98af-4e63-9ecd-e689302ea794",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "812aea3f-b533-43a1-b8bd-b87aaa84c76e",
										"name": "favorites"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "83e3f065-3419-424d-b46e-76e0d422bacc",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "313373c0-98af-4e63-9ecd-e689302ea794",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "83e3f065-3419-424d-b46e-76e0d422bacc",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "favorite",
										"namePlural": "favorites",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2e35f235-2139-478c-a540-e9bccd9c0a4d",
								"type": "POSITION",
								"name": "position",
								"label": "Position",
								"description": "Person record Position",
								"icon": "IconHierarchy2",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "31d8c0d4-a2a2-4d28-9ea2-d55f287d8999",
								"type": "SELECT",
								"name": "testSelect",
								"label": "Test select",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:39:03.797Z",
								"updatedAt": "2024-06-07T09:39:03.797Z",
								"defaultValue": null,
								"options": [
									{
										"id": "05410d4f-3447-4b3a-836b-6724876ee9bc",
										"color": "green",
										"label": "Option 1",
										"value": "OPTION_1",
										"position": 0
									},
									{
										"id": "d0165ddd-7ad5-4a19-9cfb-5596ebc4a41b",
										"color": "turquoise",
										"label": "Option 2",
										"value": "OPTION_2",
										"position": 1
									},
									{
										"id": "d2747df7-44dc-4cd1-ae4d-76559bf35e4e",
										"color": "sky",
										"label": "Option 3",
										"value": "OPTION_3",
										"position": 2
									},
									{
										"id": "696cdf92-d12c-4a74-ab57-70a9f7f62de9",
										"color": "blue",
										"label": "Option 4",
										"value": "OPTION_4",
										"position": 3
									},
									{
										"id": "fc6ba02d-6853-490d-97e5-9ddea4f0ab20",
										"color": "purple",
										"label": "Option 5",
										"value": "OPTION_5",
										"position": 4
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7a39618f-1aa7-4a6d-8965-fd6a1a4b7c20",
								"type": "NUMBER",
								"name": "testNumber",
								"label": "Test number",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:38:36.510Z",
								"updatedAt": "2024-06-07T09:38:36.510Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "062edd24-2b82-47b4-903c-4d5ba8756d9d",
								"type": "BOOLEAN",
								"name": "testBoolean",
								"label": "Test boolean",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:32:57.922Z",
								"updatedAt": "2024-06-07T09:39:40.715Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a1ff7641-5c7f-4dce-8264-455666d77450",
								"type": "LINK",
								"name": "linkedinLink",
								"label": "Linkedin",
								"description": "Contact’s Linkedin account",
								"icon": "IconBrandLinkedin",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "adcf8f46-55b8-4060-af85-cbdb82308aca",
								"type": "RELATION",
								"name": "timelineActivities",
								"label": "Events",
								"description": "Events linked to the company",
								"icon": "IconTimelineEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "05f685a8-eda1-4c8d-a367-4d165f1b5ee0",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "adcf8f46-55b8-4060-af85-cbdb82308aca",
										"name": "timelineActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "d5c27551-c047-4409-8cfb-346056cb9b92",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "05f685a8-eda1-4c8d-a367-4d165f1b5ee0",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "d5c27551-c047-4409-8cfb-346056cb9b92",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a2534d90-aaf2-474b-84da-77492ce31c0b",
								"type": "EMAIL",
								"name": "email",
								"label": "Email",
								"description": "Contact’s Email",
								"icon": "IconMail",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cd47c9fc-e5d1-43f5-ba2f-d3357b6d86c6",
								"type": "TEXT",
								"name": "city",
								"label": "City",
								"description": "Contact’s city",
								"icon": "IconMap",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dd71f23a-4717-475c-9765-df35ee7adf57",
								"type": "LINK",
								"name": "testLink",
								"label": "Test link",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:32:35.068Z",
								"updatedAt": "2024-06-07T09:37:13.904Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5c9c1774-1f7d-4b7e-ba08-5ddd3dae09f1",
								"type": "RELATION",
								"name": "calendarEventParticipants",
								"label": "Calendar Event Participants",
								"description": "Calendar Event Participants",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "c8a635ef-198d-44a3-98cc-f803f5a1700f",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "5c9c1774-1f7d-4b7e-ba08-5ddd3dae09f1",
										"name": "calendarEventParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "9ff8ffc5-4747-4729-a72c-f2f9860b8aa2",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "c8a635ef-198d-44a3-98cc-f803f5a1700f",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "9ff8ffc5-4747-4729-a72c-f2f9860b8aa2",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ccefd09d-2d62-4ac2-9920-a0dfd8603d9b",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7dfcf973-36cd-4dd7-8405-31807108f465",
								"type": "TEXT",
								"name": "phone",
								"label": "Phone",
								"description": "Contact’s phone number",
								"icon": "IconPhone",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f67cab28-c0f0-4cc3-9878-366bf34d5d9d",
								"type": "RAW_JSON",
								"name": "testJson",
								"label": "Test JSON",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:40:06.402Z",
								"updatedAt": "2024-06-07T09:40:06.402Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "48459697-8b98-474d-a114-f4cc4b0a91b1",
								"type": "RELATION",
								"name": "activityTargets",
								"label": "Activities",
								"description": "Activities tied to the contact",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "b60d73fb-4bff-4c74-9376-e638bfd4a715",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "48459697-8b98-474d-a114-f4cc4b0a91b1",
										"name": "activityTargets"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "44a6181f-f572-4fc1-ba33-09c4499514a1",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "b60d73fb-4bff-4c74-9376-e638bfd4a715",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "44a6181f-f572-4fc1-ba33-09c4499514a1",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8cfc11ef-201d-4fb6-9cfd-f82a872a3f77",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "Contact’s company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "2b293dd1-7b1e-4349-b77d-5d1effe53cf7",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "8cfc11ef-201d-4fb6-9cfd-f82a872a3f77",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "29f5afd2-b0e3-43b9-bcd1-f9a767192dba",
										"name": "people"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "2b293dd1-7b1e-4349-b77d-5d1effe53cf7",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "29f5afd2-b0e3-43b9-bcd1-f9a767192dba",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "137ce599-3dfe-4021-a437-03a787f74cec",
								"type": "TEXT",
								"name": "jobTitle",
								"label": "Job Title",
								"description": "Contact’s job title",
								"icon": "IconBriefcase",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "326f4ddb-7e33-415a-8bee-11e886e08b52",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3715c0ac-c16f-4db3-b9be-e908b787929e",
								"type": "RATING",
								"name": "testRating",
								"label": "Test rating",
								"description": null,
								"icon": "IconUsers",
								"isCustom": true,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-17T13:03:52.175Z",
								"updatedAt": "2024-06-17T13:03:52.175Z",
								"defaultValue": null,
								"options": [
										{
												"id": "9876aaeb-91ac-4e02-b521-356ff0c0a6f9",
												"label": "1",
												"value": "RATING_1",
												"position": 0
										},
										{
												"id": "4651d042-0804-465b-8265-5fae554de3a8",
												"label": "2",
												"value": "RATING_2",
												"position": 1
										},
										{
												"id": "a6942bdd-a8c8-44f9-87fc-b9a7f64ee5dd",
												"label": "3",
												"value": "RATING_3",
												"position": 2
										},
										{
												"id": "a838666f-cd2f-4feb-a72f-d3447b23ad42",
												"label": "4",
												"value": "RATING_4",
												"position": 3
										},
										{
												"id": "428f765e-4792-4cea-8270-9dba60f45fd9",
												"label": "5",
												"value": "RATING_5",
												"position": 4
										}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "489177bb-2349-4319-9fda-efb466487ccb",
								"type": "RELATION",
								"name": "pointOfContactForOpportunities",
								"label": "POC for Opportunities",
								"description": "Point of Contact for Opportunities",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "cb2d1429-2bed-4ad5-9c4d-5637efbdb339",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "489177bb-2349-4319-9fda-efb466487ccb",
										"name": "pointOfContactForOpportunities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "c6008099-5271-43d6-9ab5-55a1d7be7d1b",
										"name": "pointOfContact"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "cb2d1429-2bed-4ad5-9c4d-5637efbdb339",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "c6008099-5271-43d6-9ab5-55a1d7be7d1b",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "50024036-0722-4727-bdff-ea073fcdc831",
								"type": "RELATION",
								"name": "attachments",
								"label": "Attachments",
								"description": "Attachments linked to the contact.",
								"icon": "IconFileImport",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4b99c7e5-a47e-4919-93fb-056f7813ce39",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "50024036-0722-4727-bdff-ea073fcdc831",
										"name": "attachments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "179aa192-8b24-49ba-a9a2-e81b19f6ac6e",
										"name": "person"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "4b99c7e5-a47e-4919-93fb-056f7813ce39",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "179aa192-8b24-49ba-a9a2-e81b19f6ac6e",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "attachment",
										"namePlural": "attachments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "view",
				"namePlural": "views",
				"labelSingular": "View",
				"labelPlural": "Views",
				"description": "(System) Views",
				"icon": "IconLayoutCollage",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "03ffaeae-992b-45f3-a3da-03fff10c93cb",
								"type": "TEXT",
								"name": "kanbanFieldMetadataId",
								"label": "kanbanfieldMetadataId",
								"description": "View Kanban column field",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f254836c-5164-4125-9f6e-5f278fa08e5f",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b97bc9bb-3e68-40d2-9b33-c2937915fc9f",
								"type": "RELATION",
								"name": "viewFields",
								"label": "View Fields",
								"description": "View Fields",
								"icon": "IconTag",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "0e501570-837b-4473-af63-07400ce99b52",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "b97bc9bb-3e68-40d2-9b33-c2937915fc9f",
										"name": "viewFields"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "7fb647a5-af0b-4f95-8428-fa72571a8bee",
										"nameSingular": "viewField",
										"namePlural": "viewFields"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "4f355b63-a015-488e-8d67-ea8c2c28e58a",
										"name": "view"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "0e501570-837b-4473-af63-07400ce99b52",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "4f355b63-a015-488e-8d67-ea8c2c28e58a",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "7fb647a5-af0b-4f95-8428-fa72571a8bee",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "viewField",
										"namePlural": "viewFields",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4b4e38fe-4cf5-4504-8a62-f34f593dda92",
								"type": "RELATION",
								"name": "viewSorts",
								"label": "View Sorts",
								"description": "View Sorts",
								"icon": "IconArrowsSort",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d94fad0b-db58-4f7b-b546-5f86d645ebca",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "4b4e38fe-4cf5-4504-8a62-f34f593dda92",
										"name": "viewSorts"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "a5521923-2a4f-4dff-8330-69ba0b26ea73",
										"nameSingular": "viewSort",
										"namePlural": "viewSorts"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "9daddfd5-c437-45cd-8070-311c049d36fb",
										"name": "view"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "d94fad0b-db58-4f7b-b546-5f86d645ebca",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "9daddfd5-c437-45cd-8070-311c049d36fb",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "a5521923-2a4f-4dff-8330-69ba0b26ea73",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "viewSort",
										"namePlural": "viewSorts",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8a96c5d8-43e9-42f1-be4a-473189a316d6",
								"type": "TEXT",
								"name": "type",
								"label": "Type",
								"description": "View type",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'table'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2d03e711-7791-4c1d-bb40-378232397120",
								"type": "RELATION",
								"name": "viewFilters",
								"label": "View Filters",
								"description": "View Filters",
								"icon": "IconFilterBolt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "09c6bd7d-7601-4dd2-b143-9f08b25a5566",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "2d03e711-7791-4c1d-bb40-378232397120",
										"name": "viewFilters"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "8c617a9b-9e5e-4b8a-951e-4b4066786a26",
										"nameSingular": "viewFilter",
										"namePlural": "viewFilters"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "aaee6a8c-b7d4-4de0-9bdc-de5c1fe9b539",
										"name": "view"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "09c6bd7d-7601-4dd2-b143-9f08b25a5566",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "aaee6a8c-b7d4-4de0-9bdc-de5c1fe9b539",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "8c617a9b-9e5e-4b8a-951e-4b4066786a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "viewFilter",
										"namePlural": "viewFilters",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cdf0bf44-ecd7-4404-b3b4-9b4859256482",
								"type": "UUID",
								"name": "objectMetadataId",
								"label": "Object Metadata Id",
								"description": "View target object",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5b406d20-f904-4752-9ebf-25978bb59669",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "67f3e4d2-2139-4c0c-91a1-2dc423423e19",
								"type": "POSITION",
								"name": "position",
								"label": "Position",
								"description": "View position",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "31e2dd00-bff3-43e3-8c5f-cfa526acf891",
								"type": "TEXT",
								"name": "name",
								"label": "Name",
								"description": "View name",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "77397ee3-5f66-42fe-91a6-28bc02b4f577",
								"type": "BOOLEAN",
								"name": "isCompact",
								"label": "Compact View",
								"description": "Describes if the view is in compact mode",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": false,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0bb67fec-fc79-40c0-b6cd-b48443ad8140",
								"type": "TEXT",
								"name": "icon",
								"label": "Icon",
								"description": "View icon",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b61118a7-6518-4b9f-b04a-221044ee54db",
								"type": "SELECT",
								"name": "key",
								"label": "Key",
								"description": "View key",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'INDEX'",
								"options": [
									{
										"id": "f4917981-10ac-401e-a10a-3b25ade2d591",
										"color": "red",
										"label": "Index",
										"value": "INDEX",
										"position": 0
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a62d649e-477f-41f9-8db5-eb8dbf42ddf6",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "message",
				"namePlural": "messages",
				"labelSingular": "Message",
				"labelPlural": "Messages",
				"description": "Message",
				"icon": "IconMessage",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e9ea5897-dc2f-4ec6-9973-90d07423db5b",
								"type": "DATE_TIME",
								"name": "receivedAt",
								"label": "Received At",
								"description": "The date the message was received",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "291d8c74-2bb0-4c3e-9ecf-8c395db03116",
								"type": "SELECT",
								"name": "direction",
								"label": "Direction",
								"description": "Message Direction",
								"icon": "IconDirection",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'incoming'",
								"options": [
									{
										"id": "74a83a9f-a1cd-4853-901b-16c519e49241",
										"color": "green",
										"label": "Incoming",
										"value": "incoming",
										"position": 0
									},
									{
										"id": "81fb5d1f-26bd-44c1-9a17-bf4ec61c3e90",
										"color": "blue",
										"label": "Outgoing",
										"value": "outgoing",
										"position": 1
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ed99d901-e5d9-4746-8114-bd57e6816f2d",
								"type": "TEXT",
								"name": "headerMessageId",
								"label": "Header message Id",
								"description": "Message id from the message header",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c896468d-8186-401c-8e75-11e8bdfca03a",
								"type": "TEXT",
								"name": "text",
								"label": "Text",
								"description": "Text",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2950341d-338c-46ed-a866-61a5c397e558",
								"type": "RELATION",
								"name": "messageChannelMessageAssociations",
								"label": "Message Channel Association",
								"description": "Messages from the channel.",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "a098dd38-d544-43c2-ad72-eee88fa60b9c",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "2950341d-338c-46ed-a866-61a5c397e558",
										"name": "messageChannelMessageAssociations"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "e100f9e7-aff5-46ea-bff6-3239a01ea828",
										"name": "message"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "a098dd38-d544-43c2-ad72-eee88fa60b9c",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "e100f9e7-aff5-46ea-bff6-3239a01ea828",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e881701e-03c3-49ed-b0c7-c028f81244ab",
								"type": "RELATION",
								"name": "messageThread",
								"label": "Message Thread Id",
								"description": "Message Thread Id",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "9ad26c7f-9db7-495b-b6d5-c49ea634d167",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "e881701e-03c3-49ed-b0c7-c028f81244ab",
										"name": "messageThread"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "6737187a-370b-4331-82f9-e4b6c2461f0b",
										"name": "messages"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "9ad26c7f-9db7-495b-b6d5-c49ea634d167",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "6737187a-370b-4331-82f9-e4b6c2461f0b",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6f859303-fa24-4263-a49c-ef20e810c05f",
								"type": "RELATION",
								"name": "messageParticipants",
								"label": "Message Participants",
								"description": "Message Participants",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "5659a093-e3dc-4be7-9b49-9a6ab498671e",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "6f859303-fa24-4263-a49c-ef20e810c05f",
										"name": "messageParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "776e54b2-db3d-4b75-84e6-3dc7e8a209ef",
										"name": "message"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "5659a093-e3dc-4be7-9b49-9a6ab498671e",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "776e54b2-db3d-4b75-84e6-3dc7e8a209ef",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3c8989d3-01cf-41a0-b298-3274b5516292",
								"type": "UUID",
								"name": "messageThreadId",
								"label": "Message Thread Id id (foreign key)",
								"description": "Message Thread Id id foreign key",
								"icon": "IconHash",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6c121683-c0e5-4788-a806-bf22408f0b7d",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ea19287b-4e9b-4f7f-bbce-ef77aeedac7f",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9809268c-baf6-4d55-b05b-6a550905b7d2",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "657da315-4a91-402d-9203-621b592d8090",
								"type": "TEXT",
								"name": "subject",
								"label": "Subject",
								"description": "Subject",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "calendarEvent",
				"namePlural": "calendarEvents",
				"labelSingular": "Calendar event",
				"labelPlural": "Calendar events",
				"description": "Calendar events",
				"icon": "IconCalendar",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE3"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5c768823-df78-40a6-8793-16d25df63179",
								"type": "RELATION",
								"name": "calendarChannelEventAssociations",
								"label": "Calendar Channel Event Associations",
								"description": "Calendar Channel Event Associations",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f91e1ab8-a08b-4bc6-916e-13d2e0228e14",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "5c768823-df78-40a6-8793-16d25df63179",
										"name": "calendarChannelEventAssociations"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "2661566e-a215-4c93-8b62-7b558a5ebbf5",
										"name": "calendarEvent"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "f91e1ab8-a08b-4bc6-916e-13d2e0228e14",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "2661566e-a215-4c93-8b62-7b558a5ebbf5",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e1791638-3b3c-411f-83f6-190bf51d3efa",
								"type": "TEXT",
								"name": "iCalUID",
								"label": "iCal UID",
								"description": "iCal UID",
								"icon": "IconKey",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0db24c06-22e4-4cb7-a5c2-07f6569162c8",
								"type": "TEXT",
								"name": "title",
								"label": "Title",
								"description": "Title",
								"icon": "IconH1",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a98ba601-e1fe-402a-8e36-51073465056e",
								"type": "TEXT",
								"name": "description",
								"label": "Description",
								"description": "Description",
								"icon": "IconFileDescription",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ad638363-3387-4f51-97ee-e0598367a124",
								"type": "DATE_TIME",
								"name": "startsAt",
								"label": "Start Date",
								"description": "Start Date",
								"icon": "IconCalendarClock",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "39a394f6-799f-4e7f-9995-7bc9ef771506",
								"type": "DATE_TIME",
								"name": "externalCreatedAt",
								"label": "Creation DateTime",
								"description": "Creation DateTime",
								"icon": "IconCalendarPlus",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "121f84ea-ba41-427d-8ec6-7d61668d5a3f",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fe6f579c-ca67-4f34-8f2a-b1678c0d4e62",
								"type": "BOOLEAN",
								"name": "isFullDay",
								"label": "Is Full Day",
								"description": "Is Full Day",
								"icon": "Icon24Hours",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "95dbe93e-c028-4788-a503-af5f43433a4d",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "16fd4611-28df-4486-bb80-cd8d097f77b3",
								"type": "TEXT",
								"name": "recurringEventExternalId",
								"label": "Recurring Event ID",
								"description": "Recurring Event ID",
								"icon": "IconHistory",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4aaa900a-4c08-4c55-894b-049494f76703",
								"type": "TEXT",
								"name": "location",
								"label": "Location",
								"description": "Location",
								"icon": "IconMapPin",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cbae4816-654a-4d44-80ea-2e8fbc68cf28",
								"type": "LINK",
								"name": "conferenceLink",
								"label": "Meet Link",
								"description": "Meet Link",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"url": "''",
									"label": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b2c90089-1ba3-4d7c-aa00-f9e7989e7b1c",
								"type": "DATE_TIME",
								"name": "endsAt",
								"label": "End Date",
								"description": "End Date",
								"icon": "IconCalendarClock",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e787b0b8-d449-4db9-991b-7eb48857d1e8",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e544155a-4088-44ad-9077-94dab2e4439c",
								"type": "BOOLEAN",
								"name": "isCanceled",
								"label": "Is canceled",
								"description": "Is canceled",
								"icon": "IconCalendarCancel",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "55861e8d-d5eb-4449-9f5e-45f2b8c54c83",
								"type": "TEXT",
								"name": "conferenceSolution",
								"label": "Conference Solution",
								"description": "Conference Solution",
								"icon": "IconScreenShare",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ec570b60-fc06-4890-87cf-6d7560e00144",
								"type": "RELATION",
								"name": "calendarEventParticipants",
								"label": "Event Participants",
								"description": "Event Participants",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "cb00e32f-5536-4b7e-b4e2-8dad8d7b03fe",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "ec570b60-fc06-4890-87cf-6d7560e00144",
										"name": "calendarEventParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "7d899bb1-3299-4f60-a08a-b79b44526161",
										"name": "calendarEvent"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "cb00e32f-5536-4b7e-b4e2-8dad8d7b03fe",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "7d899bb1-3299-4f60-a08a-b79b44526161",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "606f81d2-7ee1-4c42-9f7b-eede30e1c343",
								"type": "DATE_TIME",
								"name": "externalUpdatedAt",
								"label": "Update DateTime",
								"description": "Update DateTime",
								"icon": "IconCalendarCog",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "calendarEventParticipant",
				"namePlural": "calendarEventParticipants",
				"labelSingular": "Calendar event participant",
				"labelPlural": "Calendar event participants",
				"description": "Calendar event participants",
				"icon": "IconCalendar",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "39982c0b-ce01-4c25-8e79-0717cf9c7ae0",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "Person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b8317d6b-5aba-4475-bba9-c62bc5426986",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "96c5cb56-4598-4109-a33e-a666b022d600",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "Workspace Member",
								"description": "Workspace Member",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4d2b18e2-8704-42ee-994d-cf8e83e1c217",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "96c5cb56-4598-4109-a33e-a666b022d600",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "23293e02-6b84-4f0a-beba-e4325714fc9f",
										"name": "calendarEventParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "4d2b18e2-8704-42ee-994d-cf8e83e1c217",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "23293e02-6b84-4f0a-beba-e4325714fc9f",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6e6927c9-99bc-4a81-ad52-e42a6b2df882",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9ff8ffc5-4747-4729-a72c-f2f9860b8aa2",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "Person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "c8a635ef-198d-44a3-98cc-f803f5a1700f",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "9ff8ffc5-4747-4729-a72c-f2f9860b8aa2",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "5c9c1774-1f7d-4b7e-ba08-5ddd3dae09f1",
										"name": "calendarEventParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "c8a635ef-198d-44a3-98cc-f803f5a1700f",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "5c9c1774-1f7d-4b7e-ba08-5ddd3dae09f1",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3570fbbb-6f30-4fea-b2dc-d59705205292",
								"type": "BOOLEAN",
								"name": "isOrganizer",
								"label": "Is Organizer",
								"description": "Is Organizer",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": false,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cbccda72-9d0c-4671-87fe-b359fe297c07",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "Workspace Member id (foreign key)",
								"description": "Workspace Member id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5d95c937-e52a-423e-b96a-267d75af016b",
								"type": "TEXT",
								"name": "displayName",
								"label": "Display Name",
								"description": "Display Name",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9194d530-4a04-4a20-b0a9-5601eefa2720",
								"type": "TEXT",
								"name": "handle",
								"label": "Handle",
								"description": "Handle",
								"icon": "IconMail",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "80bd7163-1c7e-47fe-935d-3f76ac88011d",
								"type": "UUID",
								"name": "calendarEventId",
								"label": "Event ID id (foreign key)",
								"description": "Event ID id foreign key",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9f6f6e26-d374-4ee5-93e0-c516af7549f9",
								"type": "SELECT",
								"name": "responseStatus",
								"label": "Response Status",
								"description": "Response Status",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'NEEDS_ACTION'",
								"options": [
									{
										"id": "268caccb-5fe4-4725-af32-5cad01cca203",
										"color": "orange",
										"label": "Needs Action",
										"value": "NEEDS_ACTION",
										"position": 0
									},
									{
										"id": "a51fbd8d-fe17-4b5e-adbc-ea4373174efa",
										"color": "red",
										"label": "Declined",
										"value": "DECLINED",
										"position": 1
									},
									{
										"id": "e4c00b38-b08c-4231-ab81-1b0461bd8354",
										"color": "yellow",
										"label": "Tentative",
										"value": "TENTATIVE",
										"position": 2
									},
									{
										"id": "5cc2551a-877b-4498-b83f-9d04ef3477a1",
										"color": "green",
										"label": "Accepted",
										"value": "ACCEPTED",
										"position": 3
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c2c52d5b-ad26-4cf6-b69b-471c48f2225c",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7d899bb1-3299-4f60-a08a-b79b44526161",
								"type": "RELATION",
								"name": "calendarEvent",
								"label": "Event ID",
								"description": "Event ID",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "cb00e32f-5536-4b7e-b4e2-8dad8d7b03fe",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "7d899bb1-3299-4f60-a08a-b79b44526161",
										"name": "calendarEvent"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "ec570b60-fc06-4890-87cf-6d7560e00144",
										"name": "calendarEventParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "cb00e32f-5536-4b7e-b4e2-8dad8d7b03fe",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "ec570b60-fc06-4890-87cf-6d7560e00144",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "bbed2598-c2be-4b73-9e5b-eb40a9323c02",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "behavioralEvent",
				"namePlural": "behavioralEvents",
				"labelSingular": "Behavioral Event",
				"labelPlural": "Behavioral Events",
				"description": "An event related to user behavior",
				"icon": "IconIconTimelineEvent",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjc="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f390d049-b453-4b64-98f9-45ee44d64085",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f6a59ead-47f2-4486-869e-6346fa6f17a7",
								"type": "RAW_JSON",
								"name": "properties",
								"label": "Event details",
								"description": "Json value for event details",
								"icon": "IconListDetails",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cf25403b-cef6-45f5-a1a6-e10ea62bc857",
								"type": "RAW_JSON",
								"name": "context",
								"label": "Event context",
								"description": "Json object to provide context (user, device, workspace, etc.)",
								"icon": "IconListDetails",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fed1ea0a-df2b-48f1-acbe-8cec4a6bca4a",
								"type": "UUID",
								"name": "recordId",
								"label": "Object id",
								"description": "Event name/type",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a5e596fe-eef0-4c72-b360-b544537b3701",
								"type": "TEXT",
								"name": "name",
								"label": "Event name",
								"description": "Event name",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "400cb214-99f4-47c9-9b50-35ba2ca1cb3a",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d39e160d-8475-4af7-84d4-918802337279",
								"type": "TEXT",
								"name": "objectName",
								"label": "Object name",
								"description": "If the event is related to a particular object",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d8f3114b-0d29-4ae1-9908-f66f3d140c70",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "activityTarget",
				"namePlural": "activityTargets",
				"labelSingular": "Activity Target",
				"labelPlural": "Activity Targets",
				"description": "An activity target",
				"icon": "IconCheckbox",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEw"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "44a6181f-f572-4fc1-ba33-09c4499514a1",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "ActivityTarget person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "b60d73fb-4bff-4c74-9376-e638bfd4a715",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "44a6181f-f572-4fc1-ba33-09c4499514a1",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "48459697-8b98-474d-a114-f4cc4b0a91b1",
										"name": "activityTargets"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "b60d73fb-4bff-4c74-9376-e638bfd4a715",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "48459697-8b98-474d-a114-f4cc4b0a91b1",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8d059d8f-27ed-4aac-8655-aa3d9ea0f9ad",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3fd9a59f-3aaa-445a-b1b6-484834f4c243",
								"type": "RELATION",
								"name": "opportunity",
								"label": "Opportunity",
								"description": "ActivityTarget opportunity",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "a38b4570-f4ad-42ba-91ca-3b0700594ab6",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "3fd9a59f-3aaa-445a-b1b6-484834f4c243",
										"name": "opportunity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "cd5b7961-afe1-41e3-9c20-a17c5beb45d7",
										"name": "activityTargets"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "a38b4570-f4ad-42ba-91ca-3b0700594ab6",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "cd5b7961-afe1-41e3-9c20-a17c5beb45d7",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d200e261-66cd-4566-8d6f-20cb987087cd",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "ActivityTarget person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5912ae34-73a5-46da-b5f9-7c21e0dd9676",
								"type": "UUID",
								"name": "opportunityId",
								"label": "Opportunity id (foreign key)",
								"description": "ActivityTarget opportunity id foreign key",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ae7632c8-8b1d-403e-b1c5-c166ce746d39",
								"type": "UUID",
								"name": "activityId",
								"label": "Activity id (foreign key)",
								"description": "ActivityTarget activity id foreign key",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2a2012d8-9255-4c18-9577-2981ea7fe11a",
								"type": "RELATION",
								"name": "activity",
								"label": "Activity",
								"description": "ActivityTarget activity",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d08d2845-f4ab-4369-a188-8abdb71e150d",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "2a2012d8-9255-4c18-9577-2981ea7fe11a",
										"name": "activity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "72ffadfa-ecda-4c78-8a68-f82d442b553d",
										"name": "activityTargets"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "d08d2845-f4ab-4369-a188-8abdb71e150d",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "72ffadfa-ecda-4c78-8a68-f82d442b553d",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activity",
										"namePlural": "activities",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "1e7a5c6f-b913-4349-a672-295018c2437c",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "ActivityTarget company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "63a61588-de8c-47ec-b695-da342836625f",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "1e7a5c6f-b913-4349-a672-295018c2437c",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "c5938b67-e0e5-471b-94eb-32bfc7f8b4c6",
										"name": "activityTargets"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "63a61588-de8c-47ec-b695-da342836625f",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "c5938b67-e0e5-471b-94eb-32bfc7f8b4c6",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3bd3da79-374b-444c-8591-9ce9296d496d",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a56fc074-50fa-4a72-ba1d-9514a552f75b",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "ActivityTarget company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "79569d3b-f7d6-480a-b62f-0e87124e7bce",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "opportunity",
				"namePlural": "opportunities",
				"labelSingular": "Opportunity",
				"labelPlural": "Opportunities",
				"description": "An opportunity",
				"icon": "IconTargetArrow",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": false,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE2"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cbd58f16-c99d-4d6b-80b3-aa27b3e72b9d",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8ee597ac-9683-4eb9-b1dd-41e46f67f8bc",
								"type": "POSITION",
								"name": "position",
								"label": "Position",
								"description": "Opportunity record position",
								"icon": "IconHierarchy2",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "170c324a-821f-4c5d-a25f-a7443b2f751d",
								"type": "RELATION",
								"name": "favorites",
								"label": "Favorites",
								"description": "Favorites linked to the opportunity",
								"icon": "IconHeart",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f9177e4d-571d-450a-babb-c109af5b18d6",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "170c324a-821f-4c5d-a25f-a7443b2f751d",
										"name": "favorites"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "8fa8a81e-f9b8-4eb6-a9b4-729b1f1c75a9",
										"name": "opportunity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "f9177e4d-571d-450a-babb-c109af5b18d6",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "8fa8a81e-f9b8-4eb6-a9b4-729b1f1c75a9",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "favorite",
										"namePlural": "favorites",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fd2615ef-8c24-47e6-862c-ed2b0d9eddf4",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "Opportunity company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ab95d4bd-fa78-43b0-ba0b-7414a4bc85f0",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "fd2615ef-8c24-47e6-862c-ed2b0d9eddf4",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "e214ccd0-756d-49aa-ba7a-1b7b47ceaa65",
										"name": "opportunities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "ab95d4bd-fa78-43b0-ba0b-7414a4bc85f0",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "e214ccd0-756d-49aa-ba7a-1b7b47ceaa65",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ae3d5dd4-343d-4b4d-a426-56d1675ce0c3",
								"type": "SELECT",
								"name": "stage",
								"label": "Stage",
								"description": "Opportunity stage",
								"icon": "IconProgressCheck",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'NEW'",
								"options": [
									{
										"id": "419b0355-6c4c-48a4-99c8-7ce7d51aab04",
										"color": "red",
										"label": "New",
										"value": "NEW",
										"position": 0
									},
									{
										"id": "46f62b9a-6905-491d-a5aa-be64761793b9",
										"color": "purple",
										"label": "Screening",
										"value": "SCREENING",
										"position": 1
									},
									{
										"id": "9acd3622-57c1-4636-8818-7fbbed9126fb",
										"color": "sky",
										"label": "Meeting",
										"value": "MEETING",
										"position": 2
									},
									{
										"id": "3b130324-43ee-4fea-a599-60fb7a45563f",
										"color": "turquoise",
										"label": "Proposal",
										"value": "PROPOSAL",
										"position": 3
									},
									{
										"id": "753a4a31-374c-4040-91d4-f6fba1e7929c",
										"color": "yellow",
										"label": "Customer",
										"value": "CUSTOMER",
										"position": 4
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c6008099-5271-43d6-9ab5-55a1d7be7d1b",
								"type": "RELATION",
								"name": "pointOfContact",
								"label": "Point of Contact",
								"description": "Opportunity point of contact",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "cb2d1429-2bed-4ad5-9c4d-5637efbdb339",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "c6008099-5271-43d6-9ab5-55a1d7be7d1b",
										"name": "pointOfContact"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "489177bb-2349-4319-9fda-efb466487ccb",
										"name": "pointOfContactForOpportunities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "cb2d1429-2bed-4ad5-9c4d-5637efbdb339",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "489177bb-2349-4319-9fda-efb466487ccb",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "23c40fc1-3f1f-40b2-a5cd-5ecec3294469",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2dd0b2c4-ce5d-4783-a180-b48f8972369a",
								"type": "RELATION",
								"name": "attachments",
								"label": "Attachments",
								"description": "Attachments linked to the opportunity",
								"icon": "IconFileImport",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "3219f278-8658-410d-ae56-a795d52aee58",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "2dd0b2c4-ce5d-4783-a180-b48f8972369a",
										"name": "attachments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "61379090-02cf-4f96-8dee-6f5761323e9f",
										"name": "opportunity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "3219f278-8658-410d-ae56-a795d52aee58",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "61379090-02cf-4f96-8dee-6f5761323e9f",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "attachment",
										"namePlural": "attachments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c7180ca6-9d2a-480f-994a-e96a0935ea3a",
								"type": "CURRENCY",
								"name": "amount",
								"label": "Amount",
								"description": "Opportunity amount",
								"icon": "IconCurrencyDollar",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"amountMicros": null,
									"currencyCode": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "92853a60-273a-4e96-aca1-1f618abc123e",
								"type": "DATE_TIME",
								"name": "closeDate",
								"label": "Close date",
								"description": "Opportunity close date",
								"icon": "IconCalendarEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "80c1a65d-c475-4ce5-8ff4-533e2d75b2dc",
								"type": "TEXT",
								"name": "name",
								"label": "Name",
								"description": "The opportunity name",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e81bc2e2-9259-4b4d-a1a0-9e53c3f1b2e4",
								"type": "UUID",
								"name": "pointOfContactId",
								"label": "Point of Contact id (foreign key)",
								"description": "Opportunity point of contact id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0940cf42-487e-4c91-8cf7-5742aeace973",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5ca7bb66-e757-4764-99da-3c8e974197a5",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "Opportunity company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dd99cf8d-a10c-4d41-8469-6b5e03e5ae2e",
								"type": "TEXT",
								"name": "probability",
								"label": "Probability",
								"description": "Opportunity probability",
								"icon": "IconProgressCheck",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'0'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cd5b7961-afe1-41e3-9c20-a17c5beb45d7",
								"type": "RELATION",
								"name": "activityTargets",
								"label": "Activities",
								"description": "Activities tied to the opportunity",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "a38b4570-f4ad-42ba-91ca-3b0700594ab6",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "cd5b7961-afe1-41e3-9c20-a17c5beb45d7",
										"name": "activityTargets"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "3fd9a59f-3aaa-445a-b1b6-484834f4c243",
										"name": "opportunity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "a38b4570-f4ad-42ba-91ca-3b0700594ab6",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "3fd9a59f-3aaa-445a-b1b6-484834f4c243",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ca06db11-c292-4226-9555-d0d49f249fc4",
								"type": "RELATION",
								"name": "timelineActivities",
								"label": "Timeline Activities",
								"description": "Timeline Activities linked to the opportunity.",
								"icon": "IconTimelineEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": false,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ec6a5670-6853-4d3c-8b8e-6580bd5584dc",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "ca06db11-c292-4226-9555-d0d49f249fc4",
										"name": "timelineActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "29ff7f77-4e79-494e-aa14-dea5c136e6f7",
										"name": "opportunity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "ec6a5670-6853-4d3c-8b8e-6580bd5584dc",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "29ff7f77-4e79-494e-aa14-dea5c136e6f7",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "timelineActivity",
				"namePlural": "timelineActivities",
				"labelSingular": "Timeline Activity",
				"labelPlural": "Timeline Activities",
				"description": "Aggregated / filtered event to be displayed on the timeline",
				"icon": "IconIconTimelineEvent",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE2"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "866a3a06-bd61-4b64-9755-8d57b4427c26",
								"type": "RAW_JSON",
								"name": "properties",
								"label": "Event details",
								"description": "Json value for event details",
								"icon": "IconListDetails",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e5a4018c-c8dc-4a6d-b5ae-e029be23e7d6",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0c27da2b-afde-48bc-90f4-c58c1f6bd1d1",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "Event company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "44825151-f568-4e5b-833a-70093068fb37",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "0c27da2b-afde-48bc-90f4-c58c1f6bd1d1",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "8558d1d1-7c48-4222-a41f-acff24ea695b",
										"name": "timelineActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "44825151-f568-4e5b-833a-70093068fb37",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "8558d1d1-7c48-4222-a41f-acff24ea695b",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d5c27551-c047-4409-8cfb-346056cb9b92",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "Event person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "05f685a8-eda1-4c8d-a367-4d165f1b5ee0",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "d5c27551-c047-4409-8cfb-346056cb9b92",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "adcf8f46-55b8-4060-af85-cbdb82308aca",
										"name": "timelineActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "05f685a8-eda1-4c8d-a367-4d165f1b5ee0",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "adcf8f46-55b8-4060-af85-cbdb82308aca",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "29ff7f77-4e79-494e-aa14-dea5c136e6f7",
								"type": "RELATION",
								"name": "opportunity",
								"label": "Opportunity",
								"description": "Event opportunity",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ec6a5670-6853-4d3c-8b8e-6580bd5584dc",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "29ff7f77-4e79-494e-aa14-dea5c136e6f7",
										"name": "opportunity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "ca06db11-c292-4226-9555-d0d49f249fc4",
										"name": "timelineActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "ec6a5670-6853-4d3c-8b8e-6580bd5584dc",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "ca06db11-c292-4226-9555-d0d49f249fc4",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5fea70fb-b40c-4199-899a-7e38d9ef6043",
								"type": "TEXT",
								"name": "name",
								"label": "Event name",
								"description": "Event name",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dc81b15a-5655-491c-99d0-9f07e008bedd",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "Event company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4885f105-c593-4de1-9f90-5e5428b06bfa",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "Event person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5e0ced21-d910-47b9-a8a8-bc789a60939c",
								"type": "DATE_TIME",
								"name": "happensAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "40216419-eccc-4f63-a344-eda6f753845d",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "Workspace Member",
								"description": "Event workspace member",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "6964f5a7-8edd-41a1-98c7-9d445ee722e3",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "40216419-eccc-4f63-a344-eda6f753845d",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "de6b0b95-5481-4cc7-8dc6-cd08808b2929",
										"name": "timelineActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "6964f5a7-8edd-41a1-98c7-9d445ee722e3",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "de6b0b95-5481-4cc7-8dc6-cd08808b2929",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c18dcfda-a9fb-4e49-a215-440069a77be3",
								"type": "UUID",
								"name": "opportunityId",
								"label": "Opportunity id (foreign key)",
								"description": "Event opportunity id foreign key",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5f899b8b-a0e0-4f42-92aa-210f51d6418e",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "Workspace Member id (foreign key)",
								"description": "Event workspace member id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4731ec62-a93e-4f3f-a55b-d52f90c3bcac",
								"type": "UUID",
								"name": "linkedObjectMetadataId",
								"label": "Linked Object Metadata Id",
								"description": "inked Object Metadata Id",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7aa39de4-acfe-4090-9f13-a3854254e3bc",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "221bd36e-e315-40e9-a1ac-91f45c157c5d",
								"type": "TEXT",
								"name": "linkedRecordCachedName",
								"label": "Linked Record cached name",
								"description": "Cached record name",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c7fad8c0-d41e-4536-b7aa-c9fa2ee68109",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a55d0cad-ed84-430a-a92d-4075a3d8c6f0",
								"type": "UUID",
								"name": "linkedRecordId",
								"label": "Linked Record id",
								"description": "Linked Record id",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "messageChannel",
				"namePlural": "messageChannels",
				"labelSingular": "Message Channel",
				"labelPlural": "Message Channels",
				"description": "Message Channels",
				"icon": "IconMessage",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE2"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "30a01ab0-0daf-4a9d-8d10-5af042f3b2ee",
								"type": "SELECT",
								"name": "visibility",
								"label": "Visibility",
								"description": "Visibility",
								"icon": "IconEyeglass",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'SHARE_EVERYTHING'",
								"options": [
									{
										"id": "6a51d527-6552-4e1f-a091-7e8ad05b99dd",
										"color": "green",
										"label": "Metadata",
										"value": "METADATA",
										"position": 0
									},
									{
										"id": "b445b24d-4145-4252-a042-a9fe49d99080",
										"color": "blue",
										"label": "Subject",
										"value": "SUBJECT",
										"position": 1
									},
									{
										"id": "df5aae98-08a0-4432-ad8e-bde036b331fc",
										"color": "orange",
										"label": "Share Everything",
										"value": "SHARE_EVERYTHING",
										"position": 2
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "36751cb9-6301-4aa2-a8ec-47079c10f8dc",
								"type": "DATE_TIME",
								"name": "syncedAt",
								"label": "Last sync date",
								"description": "Last sync date",
								"icon": "IconHistory",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "95760150-a2f4-4ea7-8d59-0969a7ad642b",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "da3417b8-ede3-4546-b056-108e4c5f6ea8",
								"type": "BOOLEAN",
								"name": "isContactAutoCreationEnabled",
								"label": "Is Contact Auto Creation Enabled",
								"description": "Is Contact Auto Creation Enabled",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5270dd71-2233-4861-bf0f-d570f9a50b34",
								"type": "NUMBER",
								"name": "throttleFailureCount",
								"label": "Throttle Failure Count",
								"description": "Throttle Failure Count",
								"icon": "IconX",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": 0,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d70533e8-e473-4233-a31e-72fe51029e5c",
								"type": "TEXT",
								"name": "handle",
								"label": "Handle",
								"description": "Handle",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "227aa60b-7af8-4a5b-bb18-2b0227512204",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "28e14926-cf7e-46cc-acf9-132aabf834a4",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5b6f6a51-42af-4b7b-8040-1c36c4270916",
								"type": "SELECT",
								"name": "syncStatus",
								"label": "Sync status",
								"description": "Sync status",
								"icon": "IconStatusChange",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": [
									{
										"id": "e9ebede5-09c7-4215-8c62-4c794fae73c7",
										"color": "blue",
										"label": "Pending",
										"value": "PENDING",
										"position": 0
									},
									{
										"id": "15118700-3587-430f-a8b2-885967fc1755",
										"color": "green",
										"label": "Succeeded",
										"value": "SUCCEEDED",
										"position": 2
									},
									{
										"id": "2ba37905-ddb7-4537-82d3-cb1492874312",
										"color": "red",
										"label": "Failed",
										"value": "FAILED",
										"position": 3
									},
									{
										"id": "f4b38dde-87ff-49bd-93ba-1b79a8a7e16f",
										"color": "yellow",
										"label": "Ongoing",
										"value": "ONGOING",
										"position": 1
									},
									{
										"id": "9d79ec38-068e-4d3d-8484-ebdcb794882b",
										"color": "blue",
										"label": "Not Synced",
										"value": "NOT_SYNCED",
										"position": 4
									},
									{
										"id": "f90732e5-cc5d-4556-ba56-5a663e5ae5b6",
										"color": "green",
										"label": "Completed",
										"value": "COMPLETED",
										"position": 5
									},
									{
										"id": "627e8a55-da70-4563-948f-d77d16d6d803",
										"color": "red",
										"label": "Failed Insufficient Permissions",
										"value": "FAILED_INSUFFICIENT_PERMISSIONS",
										"position": 6
									},
									{
										"id": "69e37923-84b7-4206-aa59-1470a355b9a3",
										"color": "red",
										"label": "Failed Unknown",
										"value": "FAILED_UNKNOWN",
										"position": 7
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "198509cb-277f-4da0-acde-482cd52cd814",
								"type": "RELATION",
								"name": "messageChannelMessageAssociations",
								"label": "Message Channel Association",
								"description": "Messages from the channel.",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "965a3bf0-b43a-4391-a26f-27a1bd30476f",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "198509cb-277f-4da0-acde-482cd52cd814",
										"name": "messageChannelMessageAssociations"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "57b02715-a5e9-42fc-92c2-23d8a4aac792",
										"name": "messageChannel"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "965a3bf0-b43a-4391-a26f-27a1bd30476f",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "57b02715-a5e9-42fc-92c2-23d8a4aac792",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ad603e6a-fab4-476e-a7cf-2bac9332df8d",
								"type": "SELECT",
								"name": "type",
								"label": "Type",
								"description": "Channel Type",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'email'",
								"options": [
									{
										"id": "555d2b05-5855-483e-a0b9-98095fb332e3",
										"color": "green",
										"label": "Email",
										"value": "email",
										"position": 0
									},
									{
										"id": "7178823a-9951-4424-9359-023c8da6a1b9",
										"color": "blue",
										"label": "SMS",
										"value": "sms",
										"position": 1
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f70b4868-063a-4571-9a1f-3c3211a35a97",
								"type": "SELECT",
								"name": "syncStage",
								"label": "Sync stage",
								"description": "Sync stage",
								"icon": "IconStatusChange",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
								"options": [
									{
										"id": "7c6f5073-49f6-477e-8cdf-704c65ae7fe5",
										"color": "blue",
										"label": "Full messages list fetch pending",
										"value": "FULL_MESSAGE_LIST_FETCH_PENDING",
										"position": 0
									},
									{
										"id": "e84e3426-1897-4214-a6fa-19531edd6d29",
										"color": "blue",
										"label": "Partial messages list fetch pending",
										"value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
										"position": 1
									},
									{
										"id": "e94047e5-e441-431c-8abd-5599cc2f8f12",
										"color": "orange",
										"label": "Messages list fetch ongoing",
										"value": "MESSAGE_LIST_FETCH_ONGOING",
										"position": 2
									},
									{
										"id": "d2a12dec-08d8-4f1b-bb50-8cc097ace56a",
										"color": "blue",
										"label": "Messages import pending",
										"value": "MESSAGES_IMPORT_PENDING",
										"position": 3
									},
									{
										"id": "dcb438e2-f4af-4686-9eed-7b190afb359d",
										"color": "orange",
										"label": "Messages import ongoing",
										"value": "MESSAGES_IMPORT_ONGOING",
										"position": 4
									},
									{
										"id": "5b8cb1f1-fe9c-49cf-b8a5-38911e6fec36",
										"color": "red",
										"label": "Failed",
										"value": "FAILED",
										"position": 5
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3839e19e-028b-4ead-b641-b723e9f14e66",
								"type": "UUID",
								"name": "connectedAccountId",
								"label": "Connected Account id (foreign key)",
								"description": "Connected Account id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5ff41676-6c9e-4bc9-882f-b43f7ebf05bd",
								"type": "TEXT",
								"name": "syncCursor",
								"label": "Last sync cursor",
								"description": "Last sync cursor",
								"icon": "IconHistory",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "977f9927-1acd-42c1-913f-02de9667b840",
								"type": "RELATION",
								"name": "connectedAccount",
								"label": "Connected Account",
								"description": "Connected Account",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d180a991-84c4-4af7-8ef4-e42ea964aa1a",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "977f9927-1acd-42c1-913f-02de9667b840",
										"name": "connectedAccount"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "5d6ae55d-2eb5-4797-856f-fcddfa3513dd",
										"name": "messageChannels"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "d180a991-84c4-4af7-8ef4-e42ea964aa1a",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "5d6ae55d-2eb5-4797-856f-fcddfa3513dd",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2bb5dfac-4764-418f-bed2-8d867c681ab9",
								"type": "DATE_TIME",
								"name": "syncStageStartedAt",
								"label": "Sync stage started at",
								"description": "Sync stage started at",
								"icon": "IconHistory",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9c043b2a-40e3-4226-90f4-2081bcc8b75b",
								"type": "BOOLEAN",
								"name": "isSyncEnabled",
								"label": "Is Sync Enabled",
								"description": "Is Sync Enabled",
								"icon": "IconRefresh",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "a5521923-2a4f-4dff-8330-69ba0b26ea73",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "viewSort",
				"namePlural": "viewSorts",
				"labelSingular": "View Sort",
				"labelPlural": "View Sorts",
				"description": "(System) View Sorts",
				"icon": "IconArrowsSort",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjY="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "422466fa-13f7-4860-866b-2dafd86207c6",
								"type": "TEXT",
								"name": "direction",
								"label": "Direction",
								"description": "View Sort direction",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'asc'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0e2672f5-64bb-4921-8cd9-057a466328d9",
								"type": "UUID",
								"name": "fieldMetadataId",
								"label": "Field Metadata Id",
								"description": "View Sort target field",
								"icon": "IconTag",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8b42cd7a-53df-433b-a674-9e98c34a7f3d",
								"type": "UUID",
								"name": "viewId",
								"label": "View id (foreign key)",
								"description": "View Sort related view id foreign key",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4517a1b7-331a-416d-a4d1-313a0d730873",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "73a1574b-31f1-4d3f-a240-6d7b550f57c1",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "00c7b190-ee08-4c83-9046-e9cd68dd1f2a",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9daddfd5-c437-45cd-8070-311c049d36fb",
								"type": "RELATION",
								"name": "view",
								"label": "View",
								"description": "View Sort related view",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d94fad0b-db58-4f7b-b546-5f86d645ebca",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "a5521923-2a4f-4dff-8330-69ba0b26ea73",
										"nameSingular": "viewSort",
										"namePlural": "viewSorts"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "9daddfd5-c437-45cd-8070-311c049d36fb",
										"name": "view"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "4b4e38fe-4cf5-4504-8a62-f34f593dda92",
										"name": "viewSorts"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "d94fad0b-db58-4f7b-b546-5f86d645ebca",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "4b4e38fe-4cf5-4504-8a62-f34f593dda92",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "view",
										"namePlural": "views",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "a47a16bf-eab2-4fd3-bf50-f1a9fc225a42",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "blocklist",
				"namePlural": "blocklists",
				"labelSingular": "Blocklist",
				"labelPlural": "Blocklists",
				"description": "Blocklist",
				"icon": "IconForbid2",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjU="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8b033c4a-725b-497d-88ed-ab2fe93ef82e",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "WorkspaceMember id (foreign key)",
								"description": "WorkspaceMember id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8b58e7b4-d114-4b27-b7eb-6411f85a7a7a",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dd4629df-7066-49a7-89dc-ffd2ccc5c614",
								"type": "TEXT",
								"name": "handle",
								"label": "Handle",
								"description": "Handle",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "50ea7eae-17f1-44eb-a0df-1c841413211f",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "WorkspaceMember",
								"description": "WorkspaceMember",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "34d39eb8-8f2d-4541-ac9c-74627e65def3",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "a47a16bf-eab2-4fd3-bf50-f1a9fc225a42",
										"nameSingular": "blocklist",
										"namePlural": "blocklists"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "50ea7eae-17f1-44eb-a0df-1c841413211f",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "cf0b6bfc-d42f-4a69-ab0e-bdb7a6de85c9",
										"name": "blocklist"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "34d39eb8-8f2d-4541-ac9c-74627e65def3",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "cf0b6bfc-d42f-4a69-ab0e-bdb7a6de85c9",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c7b10446-f611-4d4a-826a-bbba648f17f3",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f88e28bf-86ae-45cf-96c9-11303232bbe2",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "connectedAccount",
				"namePlural": "connectedAccounts",
				"labelSingular": "Connected Account",
				"labelPlural": "Connected Accounts",
				"description": "A connected account",
				"icon": "IconAt",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6c3e4ebf-271a-4091-91e6-5bc0666a4f5a",
								"type": "TEXT",
								"name": "handle",
								"label": "handle",
								"description": "The account handle (email, username, phone number, etc.)",
								"icon": "IconMail",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e732ec5c-814d-4d9a-81fb-f8085da76a6d",
								"type": "TEXT",
								"name": "refreshToken",
								"label": "Refresh Token",
								"description": "Messaging provider refresh token",
								"icon": "IconKey",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5f8ab6fa-af5b-4546-858a-cdb0c2ac4f4d",
								"type": "UUID",
								"name": "accountOwnerId",
								"label": "Account Owner id (foreign key)",
								"description": "Account Owner id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5d6ae55d-2eb5-4797-856f-fcddfa3513dd",
								"type": "RELATION",
								"name": "messageChannels",
								"label": "Message Channels",
								"description": "Message Channels",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d180a991-84c4-4af7-8ef4-e42ea964aa1a",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "5d6ae55d-2eb5-4797-856f-fcddfa3513dd",
										"name": "messageChannels"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "977f9927-1acd-42c1-913f-02de9667b840",
										"name": "connectedAccount"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "d180a991-84c4-4af7-8ef4-e42ea964aa1a",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "977f9927-1acd-42c1-913f-02de9667b840",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ad8a423b-20c4-4545-abd3-1694294406e5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageChannel",
										"namePlural": "messageChannels",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "de19b238-63cd-4e48-9d27-65615100c8d0",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ddf473c4-4b5e-4feb-b69b-4a4d005248ff",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4e050045-407f-42d1-b6db-e74c476c11ac",
								"type": "TEXT",
								"name": "provider",
								"label": "provider",
								"description": "The account provider",
								"icon": "IconSettings",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3b558f9d-5e8b-48b1-a260-cb5464ad4c8d",
								"type": "RELATION",
								"name": "calendarChannels",
								"label": "Calendar Channels",
								"description": "Calendar Channels",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "42b809af-849c-4cdb-ae1f-aaa0922d3f4e",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "3b558f9d-5e8b-48b1-a260-cb5464ad4c8d",
										"name": "calendarChannels"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "143e8157-1136-49ff-a956-be99d4c76155",
										"name": "connectedAccount"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "42b809af-849c-4cdb-ae1f-aaa0922d3f4e",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "143e8157-1136-49ff-a956-be99d4c76155",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6179780d-21bc-4d1b-bbc4-97d14591a921",
								"type": "TEXT",
								"name": "accessToken",
								"label": "Access Token",
								"description": "Messaging provider access token",
								"icon": "IconKey",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "395cc961-c5e0-4715-8439-c170c076fa8b",
								"type": "RELATION",
								"name": "accountOwner",
								"label": "Account Owner",
								"description": "Account Owner",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "7362ff24-6c6a-4b1c-aca7-21b9458798aa",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "395cc961-c5e0-4715-8439-c170c076fa8b",
										"name": "accountOwner"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "b2afa83b-d17c-42af-bbfe-f5c59db0a02c",
										"name": "connectedAccounts"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "7362ff24-6c6a-4b1c-aca7-21b9458798aa",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "b2afa83b-d17c-42af-bbfe-f5c59db0a02c",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a6540be4-5874-4e0b-bd76-87e681c890bf",
								"type": "TEXT",
								"name": "lastSyncHistoryId",
								"label": "Last sync history ID",
								"description": "Last sync history ID",
								"icon": "IconHistory",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a2765fcb-cd1e-4bba-b8ec-9f1c67b5fc9d",
								"type": "DATE_TIME",
								"name": "authFailedAt",
								"label": "Auth failed at",
								"description": "Auth failed at",
								"icon": "IconX",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "04892a7b-7de3-4b3e-bdc0-97b193afbb0b",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "8c617a9b-9e5e-4b8a-951e-4b4066786a26",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "viewFilter",
				"namePlural": "viewFilters",
				"labelSingular": "View Filter",
				"labelPlural": "View Filters",
				"description": "(System) View Filters",
				"icon": "IconFilterBolt",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjg="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "61923569-3ec5-420d-9ac4-2a589c1e263f",
								"type": "TEXT",
								"name": "displayValue",
								"label": "Display Value",
								"description": "View Filter Display Value",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a95ffce7-e354-4e09-a767-586463bb9ab5",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a5036b2a-f0c6-4144-afdf-abef7ce8a06d",
								"type": "UUID",
								"name": "fieldMetadataId",
								"label": "Field Metadata Id",
								"description": "View Filter target field",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "aaee6a8c-b7d4-4de0-9bdc-de5c1fe9b539",
								"type": "RELATION",
								"name": "view",
								"label": "View",
								"description": "View Filter related view",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "09c6bd7d-7601-4dd2-b143-9f08b25a5566",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "8c617a9b-9e5e-4b8a-951e-4b4066786a26",
										"nameSingular": "viewFilter",
										"namePlural": "viewFilters"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "aaee6a8c-b7d4-4de0-9bdc-de5c1fe9b539",
										"name": "view"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "2d03e711-7791-4c1d-bb40-378232397120",
										"name": "viewFilters"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "09c6bd7d-7601-4dd2-b143-9f08b25a5566",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "2d03e711-7791-4c1d-bb40-378232397120",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "view",
										"namePlural": "views",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "44bfe600-518a-4edc-8dc4-1508e70f387d",
								"type": "TEXT",
								"name": "value",
								"label": "Value",
								"description": "View Filter value",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "17b2d8a8-bf31-4eda-a6a3-3cbccc147c6f",
								"type": "UUID",
								"name": "viewId",
								"label": "View id (foreign key)",
								"description": "View Filter related view id foreign key",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d302165c-80a0-4b58-87a6-ad5fd1e2ae38",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4834cfe2-3182-4c23-955f-878471ace554",
								"type": "TEXT",
								"name": "operand",
								"label": "Operand",
								"description": "View Filter operand",
								"icon": null,
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'Contains'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c8fd2bce-febf-4810-b671-ff4d771446b2",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "messageThread",
				"namePlural": "messageThreads",
				"labelSingular": "Message Thread",
				"labelPlural": "Message Threads",
				"description": "Message Thread",
				"icon": "IconMessage",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6737187a-370b-4331-82f9-e4b6c2461f0b",
								"type": "RELATION",
								"name": "messages",
								"label": "Messages",
								"description": "Messages from the thread.",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "9ad26c7f-9db7-495b-b6d5-c49ea634d167",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "6737187a-370b-4331-82f9-e4b6c2461f0b",
										"name": "messages"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "e881701e-03c3-49ed-b0c7-c028f81244ab",
										"name": "messageThread"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "9ad26c7f-9db7-495b-b6d5-c49ea634d167",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "e881701e-03c3-49ed-b0c7-c028f81244ab",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "message",
										"namePlural": "messages",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8218e87e-bd58-4124-b5b9-a36f17972efe",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0eb467f4-cd95-4cc2-a7c5-dc2f01c9acd1",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c89757a5-8251-4b4f-a5ec-8aba89a50a49",
								"type": "RELATION",
								"name": "messageChannelMessageAssociations",
								"label": "Message Channel Association",
								"description": "Messages from the channel",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "8518d75e-58c3-46c2-a111-a43f3987bb5a",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "8a811392-01fa-4725-bf18-6f94e60d9d8e",
										"nameSingular": "messageThread",
										"namePlural": "messageThreads"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "c89757a5-8251-4b4f-a5ec-8aba89a50a49",
										"name": "messageChannelMessageAssociations"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "57d32dec-d975-4e0d-bcd8-4fb4eaba978d",
										"name": "messageThread"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "8518d75e-58c3-46c2-a111-a43f3987bb5a",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "57d32dec-d975-4e0d-bcd8-4fb4eaba978d",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ff218fee-2274-4c2e-91b2-ff56249ce144",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageChannelMessageAssociation",
										"namePlural": "messageChannelMessageAssociations",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "82d81026-6816-4554-aa53-0b47f3f3e759",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "messageParticipant",
				"namePlural": "messageParticipants",
				"labelSingular": "Message Participant",
				"labelPlural": "Message Participants",
				"description": "Message Participants",
				"icon": "IconUserCircle",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c6186a67-5032-4f7f-9435-7c10a8efeeab",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "Person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3c4946f0-49fe-47ae-888f-e1aa94605057",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3cee348f-955d-48c4-9618-292bdccc589c",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "Workspace Member id (foreign key)",
								"description": "Workspace member id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fa6b2391-61fc-4008-86c0-dacff59c5036",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "94934fdc-2e4d-43b0-8446-105bb7b9c9bd",
								"type": "TEXT",
								"name": "displayName",
								"label": "Display Name",
								"description": "Display Name",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0f870437-4809-4d36-ad60-51fd08fce03c",
								"type": "TEXT",
								"name": "handle",
								"label": "Handle",
								"description": "Handle",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "776e54b2-db3d-4b75-84e6-3dc7e8a209ef",
								"type": "RELATION",
								"name": "message",
								"label": "Message",
								"description": "Message",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "5659a093-e3dc-4be7-9b49-9a6ab498671e",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "776e54b2-db3d-4b75-84e6-3dc7e8a209ef",
										"name": "message"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"nameSingular": "message",
										"namePlural": "messages"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "6f859303-fa24-4263-a49c-ef20e810c05f",
										"name": "messageParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "5659a093-e3dc-4be7-9b49-9a6ab498671e",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "6f859303-fa24-4263-a49c-ef20e810c05f",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "ef2f11c1-d293-4774-bd79-006a8f367fd8",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "message",
										"namePlural": "messages",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5c4982ac-46ed-4912-96c4-1977138c6df6",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4f81e76c-54f3-4a8c-89f7-9ed806154a66",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "Workspace Member",
								"description": "Workspace member",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "40a3eefd-e2c0-4e59-934d-e6e6b7eb695c",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "4f81e76c-54f3-4a8c-89f7-9ed806154a66",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "9082d9b0-08af-45d6-9047-534f804e3c02",
										"name": "messageParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "40a3eefd-e2c0-4e59-934d-e6e6b7eb695c",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "9082d9b0-08af-45d6-9047-534f804e3c02",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "612a8e89-da49-4212-8b5a-c5f56019f19f",
								"type": "UUID",
								"name": "messageId",
								"label": "Message id (foreign key)",
								"description": "Message id foreign key",
								"icon": "IconMessage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "392dc86a-75b5-433e-9a1e-ef11e022e975",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "Person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "e2296019-f6ef-4bab-aa5e-2cd60b4c886c",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "392dc86a-75b5-433e-9a1e-ef11e022e975",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "7b1e5fbc-1418-4e35-9df2-5f5e3b64a2dd",
										"name": "messageParticipants"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "e2296019-f6ef-4bab-aa5e-2cd60b4c886c",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "7b1e5fbc-1418-4e35-9df2-5f5e3b64a2dd",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d47f550b-9dd7-4137-b111-3302194a1b6e",
								"type": "SELECT",
								"name": "role",
								"label": "Role",
								"description": "Role",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'from'",
								"options": [
									{
										"id": "06f956ef-25b2-4c99-ab22-b1fbfcdc78b8",
										"color": "green",
										"label": "From",
										"value": "from",
										"position": 0
									},
									{
										"id": "ecdb5f1f-d442-4eef-abed-5b97194aac5d",
										"color": "blue",
										"label": "To",
										"value": "to",
										"position": 1
									},
									{
										"id": "1092e3b5-29f7-47f0-b153-02e59d25b3c2",
										"color": "orange",
										"label": "Cc",
										"value": "cc",
										"position": 2
									},
									{
										"id": "1acf90c3-265d-4725-879f-2df2ccb872d9",
										"color": "red",
										"label": "Bcc",
										"value": "bcc",
										"position": 3
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "7fb647a5-af0b-4f95-8428-fa72571a8bee",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "viewField",
				"namePlural": "viewFields",
				"labelSingular": "View Field",
				"labelPlural": "View Fields",
				"description": "(System) View Fields",
				"icon": "IconTag",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjg="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5409b174-5453-456a-8a28-65ef7b73b95c",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2d987caf-9ddb-4dac-bdb8-90168f070c5b",
								"type": "BOOLEAN",
								"name": "isVisible",
								"label": "Visible",
								"description": "View Field visibility",
								"icon": "IconEye",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ee71934a-3ed3-4b2f-ac48-fe2755fe983c",
								"type": "UUID",
								"name": "viewId",
								"label": "View id (foreign key)",
								"description": "View Field related view id foreign key",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "484c8852-8049-4082-993b-29e49e713bf9",
								"type": "UUID",
								"name": "fieldMetadataId",
								"label": "Field Metadata Id",
								"description": "View Field target field",
								"icon": "IconTag",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0e55d284-458e-49ad-b349-357045d4dff5",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c6bb84d2-8c37-432d-9732-f9a7fa97a48b",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "60e26856-075b-4ac3-b246-503fb55220d8",
								"type": "NUMBER",
								"name": "size",
								"label": "Size",
								"description": "View Field size",
								"icon": "IconEye",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": 0,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "be8d505d-079c-462c-aec3-1d89f38a29fe",
								"type": "NUMBER",
								"name": "position",
								"label": "Position",
								"description": "View Field position",
								"icon": "IconList",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": 0,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4f355b63-a015-488e-8d67-ea8c2c28e58a",
								"type": "RELATION",
								"name": "view",
								"label": "View",
								"description": "View Field related view",
								"icon": "IconLayoutCollage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "0e501570-837b-4473-af63-07400ce99b52",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "7fb647a5-af0b-4f95-8428-fa72571a8bee",
										"nameSingular": "viewField",
										"namePlural": "viewFields"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "4f355b63-a015-488e-8d67-ea8c2c28e58a",
										"name": "view"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"nameSingular": "view",
										"namePlural": "views"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "b97bc9bb-3e68-40d2-9b33-c2937915fc9f",
										"name": "viewFields"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "0e501570-837b-4473-af63-07400ce99b52",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "b97bc9bb-3e68-40d2-9b33-c2937915fc9f",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f2785a7a-b2b7-4ce7-9042-ec63b49931eb",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "view",
										"namePlural": "views",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "723221aa-d945-4667-9563-3d06186d7f14",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "activity",
				"namePlural": "activities",
				"labelSingular": "Activity",
				"labelPlural": "Activities",
				"description": "An activity",
				"icon": "IconCheckbox",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5768c343-4127-4f36-b750-9558f0ac2f14",
								"type": "DATE_TIME",
								"name": "dueAt",
								"label": "Due Date",
								"description": "Activity due date",
								"icon": "IconCalendarEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "a546e207-8380-41ff-9e65-d9e2cf258412",
								"type": "DATE_TIME",
								"name": "reminderAt",
								"label": "Reminder Date",
								"description": "Activity reminder date",
								"icon": "IconCalendarEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "72b3344e-04b1-4e0a-ac66-7b47eb2498b7",
								"type": "RELATION",
								"name": "assignee",
								"label": "Assignee",
								"description": "Activity assignee",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "daad07d2-8c0b-4f7a-a10f-273e5c3586e8",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "72b3344e-04b1-4e0a-ac66-7b47eb2498b7",
										"name": "assignee"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "86e2868f-e6af-4629-b00a-84972c3c3e8f",
										"name": "assignedActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "daad07d2-8c0b-4f7a-a10f-273e5c3586e8",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "86e2868f-e6af-4629-b00a-84972c3c3e8f",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c4e8d3c9-763f-4b13-9a84-c7f0224c3cd2",
								"type": "DATE_TIME",
								"name": "completedAt",
								"label": "Completion Date",
								"description": "Activity completion date",
								"icon": "IconCheck",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e12b7288-d018-4091-9e97-4200a3ad77fc",
								"type": "UUID",
								"name": "authorId",
								"label": "Author id (foreign key)",
								"description": "Activity author id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f413df0e-524e-486d-8d94-d0577027237e",
								"type": "TEXT",
								"name": "title",
								"label": "Title",
								"description": "Activity title",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "72ffadfa-ecda-4c78-8a68-f82d442b553d",
								"type": "RELATION",
								"name": "activityTargets",
								"label": "Targets",
								"description": "Activity targets",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d08d2845-f4ab-4369-a188-8abdb71e150d",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "72ffadfa-ecda-4c78-8a68-f82d442b553d",
										"name": "activityTargets"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "2a2012d8-9255-4c18-9577-2981ea7fe11a",
										"name": "activity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "d08d2845-f4ab-4369-a188-8abdb71e150d",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "2a2012d8-9255-4c18-9577-2981ea7fe11a",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "b3db5174-865b-4da3-9c7f-fd2a816b3d90",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activityTarget",
										"namePlural": "activityTargets",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "10b42cf0-a57c-4e35-97ec-336952040be2",
								"type": "RELATION",
								"name": "comments",
								"label": "Comments",
								"description": "Activity comments",
								"icon": "IconComment",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ee654bd4-29bf-4f12-94a2-069ea032af8b",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "10b42cf0-a57c-4e35-97ec-336952040be2",
										"name": "comments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"nameSingular": "comment",
										"namePlural": "comments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "18fc498e-f1ba-4a45-a49d-5acac3eb606c",
										"name": "activity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "ee654bd4-29bf-4f12-94a2-069ea032af8b",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "18fc498e-f1ba-4a45-a49d-5acac3eb606c",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "comment",
										"namePlural": "comments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4ce01a80-f7f0-45cb-a6e9-eb1db83a413a",
								"type": "UUID",
								"name": "assigneeId",
								"label": "Assignee id (foreign key)",
								"description": "Activity assignee id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "50f226f7-57a6-447b-a9a8-47a5db4e33b6",
								"type": "TEXT",
								"name": "type",
								"label": "Type",
								"description": "Activity type",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'Note'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "69d59f37-101e-4fff-a270-44a2ed8319e5",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d14e70fb-081d-4b09-9002-e42ea0acc4f6",
								"type": "RELATION",
								"name": "attachments",
								"label": "Attachments",
								"description": "Activity attachments",
								"icon": "IconFileImport",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "766a94ea-8935-45c2-8828-60649c73d3e5",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "d14e70fb-081d-4b09-9002-e42ea0acc4f6",
										"name": "attachments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "278876b8-4245-4b3a-a50e-ddd4dd2be0a0",
										"name": "activity"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "766a94ea-8935-45c2-8828-60649c73d3e5",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "278876b8-4245-4b3a-a50e-ddd4dd2be0a0",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "attachment",
										"namePlural": "attachments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2623f7b8-87a2-4213-9f2e-211c5e69f6a5",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "09296fb4-914c-495e-b7d3-1d6830d0c8e7",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "76d0579a-b32b-41c0-ba8f-b3e2a891af11",
								"type": "RELATION",
								"name": "author",
								"label": "Author",
								"description": "Activity author",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "fc0b5b46-da68-45d0-850b-fae825805507",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "76d0579a-b32b-41c0-ba8f-b3e2a891af11",
										"name": "author"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "527a55ab-6aa7-4c6f-9476-052c568f42d5",
										"name": "authoredActivities"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "fc0b5b46-da68-45d0-850b-fae825805507",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "527a55ab-6aa7-4c6f-9476-052c568f42d5",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f7d5db6e-0916-49cc-a4d4-b0489b8fbdbc",
								"type": "TEXT",
								"name": "body",
								"label": "Body",
								"description": "Activity body",
								"icon": "IconList",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "71c95623-ea5b-4a6f-ac62-20cc2a04f8b7",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "auditLog",
				"namePlural": "auditLogs",
				"labelSingular": "Audit Log",
				"labelPlural": "Audit Logs",
				"description": "An audit log of actions performed in the system",
				"icon": "IconIconTimelineEvent",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEw"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "18cc1590-50c9-4c76-92da-307f1cbd538e",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "Workspace Member",
								"description": "Event workspace member",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f2ecb7d8-b7f3-42d6-b435-f4b48adf0a6d",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "71c95623-ea5b-4a6f-ac62-20cc2a04f8b7",
										"nameSingular": "auditLog",
										"namePlural": "auditLogs"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "18cc1590-50c9-4c76-92da-307f1cbd538e",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "4c445e0e-6157-47b1-b5f3-fff8483f6cfb",
										"name": "auditLogs"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "f2ecb7d8-b7f3-42d6-b435-f4b48adf0a6d",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "4c445e0e-6157-47b1-b5f3-fff8483f6cfb",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c6aff1c6-a93a-48d4-b672-0408ced43c64",
								"type": "TEXT",
								"name": "objectName",
								"label": "Object name",
								"description": "If the event is related to a particular object",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c42df07a-210e-4c6d-b3c0-bf10141b4650",
								"type": "TEXT",
								"name": "name",
								"label": "Event name",
								"description": "Event name/type",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "95cf88a8-cf9b-4c77-b4f6-b57a8be8142a",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "262f5029-c4ac-47e5-9552-20f92440c9d9",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ccb2add4-fa25-4314-a55b-4c83dd5b2d40",
								"type": "UUID",
								"name": "recordId",
								"label": "Object id",
								"description": "Event name/type",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "10dc7e8f-39d4-4165-b835-0c159d0383cc",
								"type": "TEXT",
								"name": "objectMetadataId",
								"label": "Object name",
								"description": "If the event is related to a particular object",
								"icon": "IconAbc",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "baf57f5d-55b2-4497-8e9e-e2c56682201e",
								"type": "RAW_JSON",
								"name": "context",
								"label": "Event context",
								"description": "Json object to provide context (user, device, workspace, etc.)",
								"icon": "IconListDetails",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e8e38fc0-5ece-4651-a614-3fb5449b1c07",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c9c07299-04f4-467a-a71f-db95bf2ce1f0",
								"type": "RAW_JSON",
								"name": "properties",
								"label": "Event details",
								"description": "Json value for event details",
								"icon": "IconListDetails",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7f4f46e6-6479-4b1e-88dd-b085b23510b6",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "Workspace Member id (foreign key)",
								"description": "Event workspace member id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "calendarChannel",
				"namePlural": "calendarChannels",
				"labelSingular": "Calendar Channel",
				"labelPlural": "Calendar Channels",
				"description": "Calendar Channels",
				"icon": "IconCalendar",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "322d18bf-d629-4867-8d42-a7fe0f0e84bd",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "143e8157-1136-49ff-a956-be99d4c76155",
								"type": "RELATION",
								"name": "connectedAccount",
								"label": "Connected Account",
								"description": "Connected Account",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "42b809af-849c-4cdb-ae1f-aaa0922d3f4e",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "143e8157-1136-49ff-a956-be99d4c76155",
										"name": "connectedAccount"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "3b558f9d-5e8b-48b1-a260-cb5464ad4c8d",
										"name": "calendarChannels"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "42b809af-849c-4cdb-ae1f-aaa0922d3f4e",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "3b558f9d-5e8b-48b1-a260-cb5464ad4c8d",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "eafe3727-d061-4cae-a7dc-ab8bf5743ddc",
								"type": "NUMBER",
								"name": "throttleFailureCount",
								"label": "Throttle Failure Count",
								"description": "Throttle Failure Count",
								"icon": "IconX",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": 0,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "75975274-8627-48cb-af2f-9b63936bd8cd",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "87f918a0-a5e8-4b9b-ac0a-131e780e2f29",
								"type": "BOOLEAN",
								"name": "isSyncEnabled",
								"label": "Is Sync Enabled",
								"description": "Is Sync Enabled",
								"icon": "IconRefresh",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8da769d8-e793-4439-b468-43361047fe3a",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ed229cd6-ff79-462e-be57-8af68792f737",
								"type": "TEXT",
								"name": "syncCursor",
								"label": "Sync Cursor",
								"description": "Sync Cursor. Used for syncing events from the calendar provider",
								"icon": "IconReload",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9f26f6a7-7610-4263-b520-99dfbdf14180",
								"type": "SELECT",
								"name": "visibility",
								"label": "Visibility",
								"description": "Visibility",
								"icon": "IconEyeglass",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'SHARE_EVERYTHING'",
								"options": [
									{
										"id": "04a22518-0b58-4ac5-9287-1145f7abd831",
										"color": "green",
										"label": "Metadata",
										"value": "METADATA",
										"position": 0
									},
									{
										"id": "6ee22ede-8710-44f8-9566-66e38987281e",
										"color": "orange",
										"label": "Share Everything",
										"value": "SHARE_EVERYTHING",
										"position": 1
									}
								],
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0bac812e-5fe7-4b59-a96e-7a1322e48935",
								"type": "BOOLEAN",
								"name": "isContactAutoCreationEnabled",
								"label": "Is Contact Auto Creation Enabled",
								"description": "Is Contact Auto Creation Enabled",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": true,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b6d4d880-1a87-4ee1-8c7f-8fa1f061641d",
								"type": "RELATION",
								"name": "calendarChannelEventAssociations",
								"label": "Calendar Channel Event Associations",
								"description": "Calendar Channel Event Associations",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "3034a445-6ce9-4218-b157-c657437ed426",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "b6d4d880-1a87-4ee1-8c7f-8fa1f061641d",
										"name": "calendarChannelEventAssociations"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "32d7cbd6-4715-4e79-94cf-d7ae1f961dba",
										"name": "calendarChannel"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "3034a445-6ce9-4218-b157-c657437ed426",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "32d7cbd6-4715-4e79-94cf-d7ae1f961dba",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "68c314e0-8722-474a-aa44-59be3e4a5094",
								"type": "TEXT",
								"name": "handle",
								"label": "Handle",
								"description": "Handle",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e3036a6c-e3fa-4932-9f14-94f0315b3420",
								"type": "UUID",
								"name": "connectedAccountId",
								"label": "Connected Account id (foreign key)",
								"description": "Connected Account id foreign key",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "workspaceMember",
				"namePlural": "workspaceMembers",
				"labelSingular": "Workspace Member",
				"labelPlural": "Workspace Members",
				"description": "A workspace member",
				"icon": "IconUserCircle",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjIw"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "86e2868f-e6af-4629-b00a-84972c3c3e8f",
								"type": "RELATION",
								"name": "assignedActivities",
								"label": "Assigned activities",
								"description": "Activities assigned to the workspace member",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "daad07d2-8c0b-4f7a-a10f-273e5c3586e8",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "86e2868f-e6af-4629-b00a-84972c3c3e8f",
										"name": "assignedActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "72b3344e-04b1-4e0a-ac66-7b47eb2498b7",
										"name": "assignee"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "daad07d2-8c0b-4f7a-a10f-273e5c3586e8",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "72b3344e-04b1-4e0a-ac66-7b47eb2498b7",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activity",
										"namePlural": "activities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8ede3375-da0e-4bb5-9444-a042523ccc33",
								"type": "FULL_NAME",
								"name": "name",
								"label": "Name",
								"description": "Workspace member name",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": {
									"lastName": "''",
									"firstName": "''"
								},
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cf0b6bfc-d42f-4a69-ab0e-bdb7a6de85c9",
								"type": "RELATION",
								"name": "blocklist",
								"label": "Blocklist",
								"description": "Blocklisted handles",
								"icon": "IconForbid2",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "34d39eb8-8f2d-4541-ac9c-74627e65def3",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "cf0b6bfc-d42f-4a69-ab0e-bdb7a6de85c9",
										"name": "blocklist"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "a47a16bf-eab2-4fd3-bf50-f1a9fc225a42",
										"nameSingular": "blocklist",
										"namePlural": "blocklists"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "50ea7eae-17f1-44eb-a0df-1c841413211f",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "34d39eb8-8f2d-4541-ac9c-74627e65def3",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "50ea7eae-17f1-44eb-a0df-1c841413211f",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "a47a16bf-eab2-4fd3-bf50-f1a9fc225a42",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "blocklist",
										"namePlural": "blocklists",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "937a5c60-3dc6-4c57-88f7-5b7c888db1fa",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fdaa3e1e-4b14-4526-b9c5-a8fbbf1789ff",
								"type": "TEXT",
								"name": "userEmail",
								"label": "User Email",
								"description": "Related user email address",
								"icon": "IconMail",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "527a55ab-6aa7-4c6f-9476-052c568f42d5",
								"type": "RELATION",
								"name": "authoredActivities",
								"label": "Authored activities",
								"description": "Activities created by the workspace member",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "fc0b5b46-da68-45d0-850b-fae825805507",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "527a55ab-6aa7-4c6f-9476-052c568f42d5",
										"name": "authoredActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "76d0579a-b32b-41c0-ba8f-b3e2a891af11",
										"name": "author"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "fc0b5b46-da68-45d0-850b-fae825805507",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "76d0579a-b32b-41c0-ba8f-b3e2a891af11",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activity",
										"namePlural": "activities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "03d793d5-59dd-4fef-ab31-c5f21c42252e",
								"type": "UUID",
								"name": "userId",
								"label": "User Id",
								"description": "Associated User Id",
								"icon": "IconCircleUsers",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "67d62616-508b-4c54-a5a1-212c7edcb602",
								"type": "TEXT",
								"name": "avatarUrl",
								"label": "Avatar Url",
								"description": "Workspace member avatar",
								"icon": "IconFileUpload",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "aee083d6-f7b1-4c26-ab53-3183b8b1d4d8",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b2afa83b-d17c-42af-bbfe-f5c59db0a02c",
								"type": "RELATION",
								"name": "connectedAccounts",
								"label": "Connected accounts",
								"description": "Connected accounts",
								"icon": "IconAt",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "7362ff24-6c6a-4b1c-aca7-21b9458798aa",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "b2afa83b-d17c-42af-bbfe-f5c59db0a02c",
										"name": "connectedAccounts"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "395cc961-c5e0-4715-8439-c170c076fa8b",
										"name": "accountOwner"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "7362ff24-6c6a-4b1c-aca7-21b9458798aa",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "395cc961-c5e0-4715-8439-c170c076fa8b",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "9e54a328-9247-4d39-8999-35007b4bd34d",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "connectedAccount",
										"namePlural": "connectedAccounts",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e530abeb-c6d7-43dc-a4f2-3f04b7000738",
								"type": "RELATION",
								"name": "authoredAttachments",
								"label": "Authored attachments",
								"description": "Attachments created by the workspace member",
								"icon": "IconFileImport",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d74d14b6-130b-49ac-83fe-5c564ed96e18",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "e530abeb-c6d7-43dc-a4f2-3f04b7000738",
										"name": "authoredAttachments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "0a8628a5-0a2a-4dc8-b7f7-c852a5cd50d8",
										"name": "author"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "d74d14b6-130b-49ac-83fe-5c564ed96e18",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "0a8628a5-0a2a-4dc8-b7f7-c852a5cd50d8",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "attachment",
										"namePlural": "attachments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "4c445e0e-6157-47b1-b5f3-fff8483f6cfb",
								"type": "RELATION",
								"name": "auditLogs",
								"label": "Audit Logs",
								"description": "Audit Logs linked to the workspace member",
								"icon": "IconTimelineEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f2ecb7d8-b7f3-42d6-b435-f4b48adf0a6d",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "4c445e0e-6157-47b1-b5f3-fff8483f6cfb",
										"name": "auditLogs"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "71c95623-ea5b-4a6f-ac62-20cc2a04f8b7",
										"nameSingular": "auditLog",
										"namePlural": "auditLogs"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "18cc1590-50c9-4c76-92da-307f1cbd538e",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "f2ecb7d8-b7f3-42d6-b435-f4b48adf0a6d",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "18cc1590-50c9-4c76-92da-307f1cbd538e",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "71c95623-ea5b-4a6f-ac62-20cc2a04f8b7",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "auditLog",
										"namePlural": "auditLogs",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "46ad37c6-7934-41af-b1b1-51b06d7d230c",
								"type": "RELATION",
								"name": "favorites",
								"label": "Favorites",
								"description": "Favorites linked to the workspace member",
								"icon": "IconHeart",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "5f13fa68-4367-4a2f-b50c-d40bde96953a",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "46ad37c6-7934-41af-b1b1-51b06d7d230c",
										"name": "favorites"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "b1ba6c14-de0b-491b-96e7-e693f359c6f6",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "5f13fa68-4367-4a2f-b50c-d40bde96953a",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "b1ba6c14-de0b-491b-96e7-e693f359c6f6",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "favorite",
										"namePlural": "favorites",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0604d7f7-f2d1-4d0e-84d5-13df68ea688b",
								"type": "TEXT",
								"name": "colorScheme",
								"label": "Color Scheme",
								"description": "Preferred color scheme",
								"icon": "IconColorSwatch",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'Light'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "79edf404-895d-4db5-9c93-140c547d5af9",
								"type": "RELATION",
								"name": "accountOwnerForCompanies",
								"label": "Account Owner For Companies",
								"description": "Account owner for companies",
								"icon": "IconBriefcase",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4d810e79-eae5-4212-984b-8e95632fd07d",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "79edf404-895d-4db5-9c93-140c547d5af9",
										"name": "accountOwnerForCompanies"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "8fcf63f1-91cd-42c7-bc6d-99f21ab3e9af",
										"name": "accountOwner"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "4d810e79-eae5-4212-984b-8e95632fd07d",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "8fcf63f1-91cd-42c7-bc6d-99f21ab3e9af",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "de6b0b95-5481-4cc7-8dc6-cd08808b2929",
								"type": "RELATION",
								"name": "timelineActivities",
								"label": "Events",
								"description": "Events linked to the workspace member",
								"icon": "IconTimelineEvent",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "6964f5a7-8edd-41a1-98c7-9d445ee722e3",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "de6b0b95-5481-4cc7-8dc6-cd08808b2929",
										"name": "timelineActivities"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "40216419-eccc-4f63-a344-eda6f753845d",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "6964f5a7-8edd-41a1-98c7-9d445ee722e3",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "40216419-eccc-4f63-a344-eda6f753845d",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "ae47ee7c-ea45-4273-94ee-336d1433ae33",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "timelineActivity",
										"namePlural": "timelineActivities",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "23293e02-6b84-4f0a-beba-e4325714fc9f",
								"type": "RELATION",
								"name": "calendarEventParticipants",
								"label": "Calendar Event Participants",
								"description": "Calendar Event Participants",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4d2b18e2-8704-42ee-994d-cf8e83e1c217",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "23293e02-6b84-4f0a-beba-e4325714fc9f",
										"name": "calendarEventParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "96c5cb56-4598-4109-a33e-a666b022d600",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "4d2b18e2-8704-42ee-994d-cf8e83e1c217",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "96c5cb56-4598-4109-a33e-a666b022d600",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "c8fcc468-5891-4938-abf8-ad4d99078d7c",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarEventParticipant",
										"namePlural": "calendarEventParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9082d9b0-08af-45d6-9047-534f804e3c02",
								"type": "RELATION",
								"name": "messageParticipants",
								"label": "Message Participants",
								"description": "Message Participants",
								"icon": "IconUserCircle",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "40a3eefd-e2c0-4e59-934d-e6e6b7eb695c",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "9082d9b0-08af-45d6-9047-534f804e3c02",
										"name": "messageParticipants"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "4f81e76c-54f3-4a8c-89f7-9ed806154a66",
										"name": "workspaceMember"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "40a3eefd-e2c0-4e59-934d-e6e6b7eb695c",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "4f81e76c-54f3-4a8c-89f7-9ed806154a66",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "810c0e7f-5e65-4d68-8596-1e585862bee9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "messageParticipant",
										"namePlural": "messageParticipants",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6afa53e9-d4c1-44a9-98e6-88d310e62314",
								"type": "TEXT",
								"name": "locale",
								"label": "Language",
								"description": "Preferred language",
								"icon": "IconLanguage",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "'en'",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5a85d3a7-a00c-4efb-8ccc-652f25b3fdb9",
								"type": "RELATION",
								"name": "authoredComments",
								"label": "Authored comments",
								"description": "Authored comments",
								"icon": "IconComment",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "8e8bb81e-b667-4372-bf27-5d23b2b440f6",
									"direction": "ONE_TO_MANY",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "5a85d3a7-a00c-4efb-8ccc-652f25b3fdb9",
										"name": "authoredComments"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"nameSingular": "comment",
										"namePlural": "comments"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "d17330db-5583-4e34-9223-0f96a116db4e",
										"name": "author"
									}
								},
								"fromRelationMetadata": {
									"__typename": "relation",
									"id": "8e8bb81e-b667-4372-bf27-5d23b2b440f6",
									"relationType": "ONE_TO_MANY",
									"toFieldMetadataId": "d17330db-5583-4e34-9223-0f96a116db4e",
									"toObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "comment",
										"namePlural": "comments",
										"isSystem": true,
										"isRemote": false
									}
								},
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "9d794ac2-9bba-4308-bfce-745d1417c07b",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "1ceaec2d-09a2-403d-81b7-740283492c79",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "apiKey",
				"namePlural": "apiKeys",
				"labelSingular": "Api Key",
				"labelPlural": "Api Keys",
				"description": "An api key",
				"icon": "IconRobot",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjU="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8c7336db-899f-4c0e-88e7-ad7887f13bd0",
								"type": "DATE_TIME",
								"name": "expiresAt",
								"label": "Expiration date",
								"description": "ApiKey expiration date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7a6fbfe8-4ae4-4f47-ac9d-3f53788f63bd",
								"type": "DATE_TIME",
								"name": "revokedAt",
								"label": "Revocation date",
								"description": "ApiKey revocation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "5d0565d1-ed8b-4e7d-9762-eccff24f795f",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d6c9b463-f744-4fbc-9f59-ca4c81cfb078",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8928d662-fcc4-4232-a6fa-88d0fb73c36a",
								"type": "TEXT",
								"name": "name",
								"label": "Name",
								"description": "ApiKey name",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "781d16db-c85d-4733-9671-92f0a9b4602e",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "0e780173-f829-4110-bfcf-7520d6664564",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "comment",
				"namePlural": "comments",
				"labelSingular": "Comment",
				"labelPlural": "Comments",
				"description": "A comment",
				"icon": "IconMessageCircle",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjc="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "18fc498e-f1ba-4a45-a49d-5acac3eb606c",
								"type": "RELATION",
								"name": "activity",
								"label": "Activity",
								"description": "Comment activity",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "ee654bd4-29bf-4f12-94a2-069ea032af8b",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"nameSingular": "comment",
										"namePlural": "comments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "18fc498e-f1ba-4a45-a49d-5acac3eb606c",
										"name": "activity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "10b42cf0-a57c-4e35-97ec-336952040be2",
										"name": "comments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "ee654bd4-29bf-4f12-94a2-069ea032af8b",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "10b42cf0-a57c-4e35-97ec-336952040be2",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activity",
										"namePlural": "activities",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2d417ee5-adb5-4318-b8ec-7a6d56e09b6f",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "cd9efab6-a13f-4d5b-96fc-193cd3c8bce1",
								"type": "TEXT",
								"name": "body",
								"label": "Body",
								"description": "Comment body",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "ec578fe6-3f62-4f78-8e01-794bf6791940",
								"type": "UUID",
								"name": "authorId",
								"label": "Author id (foreign key)",
								"description": "Comment author id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "bdcd5420-bb94-4487-b666-abdfcec405ab",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "d17330db-5583-4e34-9223-0f96a116db4e",
								"type": "RELATION",
								"name": "author",
								"label": "Author",
								"description": "Comment author",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "8e8bb81e-b667-4372-bf27-5d23b2b440f6",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0e780173-f829-4110-bfcf-7520d6664564",
										"nameSingular": "comment",
										"namePlural": "comments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "d17330db-5583-4e34-9223-0f96a116db4e",
										"name": "author"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "5a85d3a7-a00c-4efb-8ccc-652f25b3fdb9",
										"name": "authoredComments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "8e8bb81e-b667-4372-bf27-5d23b2b440f6",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "5a85d3a7-a00c-4efb-8ccc-652f25b3fdb9",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "11cbc09d-6e41-4a74-acfe-5eb60333aa6d",
								"type": "UUID",
								"name": "activityId",
								"label": "Activity id (foreign key)",
								"description": "Comment activity id foreign key",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fe93ba79-5409-4a30-9d26-983ac9b5acf3",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "attachment",
				"namePlural": "attachments",
				"labelSingular": "Attachment",
				"labelPlural": "Attachments",
				"description": "An attachment",
				"icon": "IconFileImport",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "963e4803-1fce-416d-a450-69c704658d9b",
								"type": "UUID",
								"name": "activityId",
								"label": "Activity id (foreign key)",
								"description": "Attachment activity id foreign key",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "61379090-02cf-4f96-8dee-6f5761323e9f",
								"type": "RELATION",
								"name": "opportunity",
								"label": "Opportunity",
								"description": "Attachment opportunity",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "3219f278-8658-410d-ae56-a795d52aee58",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "61379090-02cf-4f96-8dee-6f5761323e9f",
										"name": "opportunity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "2dd0b2c4-ce5d-4783-a180-b48f8972369a",
										"name": "attachments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "3219f278-8658-410d-ae56-a795d52aee58",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "2dd0b2c4-ce5d-4783-a180-b48f8972369a",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "e8ad2a46-3cd9-4256-b6b3-01db9e332608",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "Attachment person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2b87a17f-0f9e-44a3-85c0-d6ccaa3d419b",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7fe03d5a-5ad4-4f83-ba5b-5f426ddfed1f",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "Attachment company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "3dc50db7-afc5-43ab-9636-5a6ee4b034f3",
								"type": "TEXT",
								"name": "name",
								"label": "Name",
								"description": "Attachment name",
								"icon": "IconFileUpload",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8538ff1e-9223-4498-8c3c-7c25235887c7",
								"type": "UUID",
								"name": "opportunityId",
								"label": "Opportunity id (foreign key)",
								"description": "Attachment opportunity id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "278876b8-4245-4b3a-a50e-ddd4dd2be0a0",
								"type": "RELATION",
								"name": "activity",
								"label": "Activity",
								"description": "Attachment activity",
								"icon": "IconNotes",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "766a94ea-8935-45c2-8828-60649c73d3e5",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "278876b8-4245-4b3a-a50e-ddd4dd2be0a0",
										"name": "activity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"nameSingular": "activity",
										"namePlural": "activities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "d14e70fb-081d-4b09-9002-e42ea0acc4f6",
										"name": "attachments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "766a94ea-8935-45c2-8828-60649c73d3e5",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "d14e70fb-081d-4b09-9002-e42ea0acc4f6",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "723221aa-d945-4667-9563-3d06186d7f14",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "activity",
										"namePlural": "activities",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c6d94dbe-a989-444e-938d-86c95d7e54f0",
								"type": "UUID",
								"name": "authorId",
								"label": "Author id (foreign key)",
								"description": "Attachment author id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "987bc5b8-3ceb-472c-bf2e-36a084cbffe1",
								"type": "TEXT",
								"name": "type",
								"label": "Type",
								"description": "Attachment type",
								"icon": "IconList",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "93a19f29-8d35-4c2e-85bb-f39097a99e91",
								"type": "TEXT",
								"name": "fullPath",
								"label": "Full path",
								"description": "Attachment full path",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8ee14cfb-aec5-490a-a37a-0793cce9c74c",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "091f3ec1-c30a-41af-bd7f-d104cb2f3875",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8e9ba278-5293-4e30-9faf-369eb3459790",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "Attachment company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "36daf4c7-9fdf-48f3-9baf-a60d290b729c",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "8e9ba278-5293-4e30-9faf-369eb3459790",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "fb558bde-aad6-4d0b-a4c6-54750c530e5e",
										"name": "attachments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "36daf4c7-9fdf-48f3-9baf-a60d290b729c",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "fb558bde-aad6-4d0b-a4c6-54750c530e5e",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "179aa192-8b24-49ba-a9a2-e81b19f6ac6e",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "Attachment person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "4b99c7e5-a47e-4919-93fb-056f7813ce39",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "179aa192-8b24-49ba-a9a2-e81b19f6ac6e",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "50024036-0722-4727-bdff-ea073fcdc831",
										"name": "attachments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "4b99c7e5-a47e-4919-93fb-056f7813ce39",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "50024036-0722-4727-bdff-ea073fcdc831",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0a8628a5-0a2a-4dc8-b7f7-c852a5cd50d8",
								"type": "RELATION",
								"name": "author",
								"label": "Author",
								"description": "Attachment author",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "d74d14b6-130b-49ac-83fe-5c564ed96e18",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "0c99085d-8a5a-4854-ad0d-ec29f3570f3a",
										"nameSingular": "attachment",
										"namePlural": "attachments"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "0a8628a5-0a2a-4dc8-b7f7-c852a5cd50d8",
										"name": "author"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "e530abeb-c6d7-43dc-a4f2-3f04b7000738",
										"name": "authoredAttachments"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "d74d14b6-130b-49ac-83fe-5c564ed96e18",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "e530abeb-c6d7-43dc-a4f2-3f04b7000738",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "calendarChannelEventAssociation",
				"namePlural": "calendarChannelEventAssociations",
				"labelSingular": "Calendar Channel Event Association",
				"labelPlural": "Calendar Channel Event Associations",
				"description": "Calendar Channel Event Associations",
				"icon": "IconCalendar",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjc="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "32d7cbd6-4715-4e79-94cf-d7ae1f961dba",
								"type": "RELATION",
								"name": "calendarChannel",
								"label": "Channel ID",
								"description": "Channel ID",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "3034a445-6ce9-4218-b157-c657437ed426",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "32d7cbd6-4715-4e79-94cf-d7ae1f961dba",
										"name": "calendarChannel"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "b6d4d880-1a87-4ee1-8c7f-8fa1f061641d",
										"name": "calendarChannelEventAssociations"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "3034a445-6ce9-4218-b157-c657437ed426",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "b6d4d880-1a87-4ee1-8c7f-8fa1f061641d",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "4f34d651-9013-43ad-9d52-de8f3713e6a5",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarChannel",
										"namePlural": "calendarChannels",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "c95687b5-72b4-48d5-890f-3d0715617bbf",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "234ef8b5-0b4f-46ae-8eb3-0f2375999b86",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "84a52c9f-fc5c-44d1-8007-5f485c91ea4c",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "2661566e-a215-4c93-8b62-7b558a5ebbf5",
								"type": "RELATION",
								"name": "calendarEvent",
								"label": "Event ID",
								"description": "Event ID",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f91e1ab8-a08b-4bc6-916e-13d2e0228e14",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "09959589-4056-4bf3-86cc-ba3e2ad28e86",
										"nameSingular": "calendarChannelEventAssociation",
										"namePlural": "calendarChannelEventAssociations"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "2661566e-a215-4c93-8b62-7b558a5ebbf5",
										"name": "calendarEvent"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "5c768823-df78-40a6-8793-16d25df63179",
										"name": "calendarChannelEventAssociations"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "f91e1ab8-a08b-4bc6-916e-13d2e0228e14",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "5c768823-df78-40a6-8793-16d25df63179",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "e5c3675a-24bf-487c-828d-0b544dacff29",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "calendarEvent",
										"namePlural": "calendarEvents",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f5061b2c-2110-4b87-80bb-ac07ca831222",
								"type": "UUID",
								"name": "calendarEventId",
								"label": "Event ID id (foreign key)",
								"description": "Event ID id foreign key",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "731d31d6-53cd-4d6b-a9d3-6de1475ba017",
								"type": "UUID",
								"name": "calendarChannelId",
								"label": "Channel ID id (foreign key)",
								"description": "Channel ID id foreign key",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "7f04fdec-6294-4038-aada-933791426649",
								"type": "TEXT",
								"name": "eventExternalId",
								"label": "Event external ID",
								"description": "Event external ID",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "038a733b-641f-4f09-8509-c210e729e6c5",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "favorite",
				"namePlural": "favorites",
				"labelSingular": "Favorite",
				"labelPlural": "Favorites",
				"description": "A favorite",
				"icon": "IconHeart",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "16f8a279-b23d-4e7a-9388-2a1f48afd21b",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "83e3f065-3419-424d-b46e-76e0d422bacc",
								"type": "RELATION",
								"name": "person",
								"label": "Person",
								"description": "Favorite person",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "313373c0-98af-4e63-9ecd-e689302ea794",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "83e3f065-3419-424d-b46e-76e0d422bacc",
										"name": "person"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"nameSingular": "person",
										"namePlural": "people"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "812aea3f-b533-43a1-b8bd-b87aaa84c76e",
										"name": "favorites"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "313373c0-98af-4e63-9ecd-e689302ea794",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "812aea3f-b533-43a1-b8bd-b87aaa84c76e",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f90f0471-1042-4f38-a285-d870fb5a5a26",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "person",
										"namePlural": "people",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f951e3c3-1bd2-41b2-9612-73a0ba3dbabb",
								"type": "UUID",
								"name": "opportunityId",
								"label": "Opportunity id (foreign key)",
								"description": "Favorite opportunity id foreign key",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "f56c8d42-3894-4ccf-8588-ad97d2a7df0a",
								"type": "RELATION",
								"name": "company",
								"label": "Company",
								"description": "Favorite company",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "b45f0926-607e-418f-9e26-613594f97868",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "f56c8d42-3894-4ccf-8588-ad97d2a7df0a",
										"name": "company"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"nameSingular": "company",
										"namePlural": "companies"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "efaa1ccd-4c1f-4d81-9d30-f93030d32190",
										"name": "favorites"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "b45f0926-607e-418f-9e26-613594f97868",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "efaa1ccd-4c1f-4d81-9d30-f93030d32190",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "f9fd99a8-108f-4066-9675-cde753cf5de9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "company",
										"namePlural": "companies",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dead3c40-1c51-49e7-8763-c59c0d0c6699",
								"type": "UUID",
								"name": "personId",
								"label": "Person id (foreign key)",
								"description": "Favorite person id foreign key",
								"icon": "IconUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "43310ae4-74bc-4b29-a6b8-02a48688bf1a",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "b1ba6c14-de0b-491b-96e7-e693f359c6f6",
								"type": "RELATION",
								"name": "workspaceMember",
								"label": "Workspace Member",
								"description": "Favorite workspace member",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "5f13fa68-4367-4a2f-b50c-d40bde96953a",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "b1ba6c14-de0b-491b-96e7-e693f359c6f6",
										"name": "workspaceMember"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "46ad37c6-7934-41af-b1b1-51b06d7d230c",
										"name": "favorites"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "5f13fa68-4367-4a2f-b50c-d40bde96953a",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "46ad37c6-7934-41af-b1b1-51b06d7d230c",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "340eeb86-e27d-4a56-b2b3-b47c2ad604d9",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "workspaceMember",
										"namePlural": "workspaceMembers",
										"isSystem": true,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "0429b209-c380-4b54-b769-e60772631ecc",
								"type": "NUMBER",
								"name": "position",
								"label": "Position",
								"description": "Favorite position",
								"icon": "IconList",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": 0,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "8fa8a81e-f9b8-4eb6-a9b4-729b1f1c75a9",
								"type": "RELATION",
								"name": "opportunity",
								"label": "Opportunity",
								"description": "Favorite opportunity",
								"icon": "IconTargetArrow",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"fromRelationMetadata": null,
								"relationDefinition": {
									"__typename": "RelationDefinition",
									"relationId": "f9177e4d-571d-450a-babb-c109af5b18d6",
									"direction": "MANY_TO_ONE",
									"sourceObjectMetadata": {
										"__typename": "object",
										"id": "038a733b-641f-4f09-8509-c210e729e6c5",
										"nameSingular": "favorite",
										"namePlural": "favorites"
									},
									"sourceFieldMetadata": {
										"__typename": "field",
										"id": "8fa8a81e-f9b8-4eb6-a9b4-729b1f1c75a9",
										"name": "opportunity"
									},
									"targetObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"nameSingular": "opportunity",
										"namePlural": "opportunities"
									},
									"targetFieldMetadata": {
										"__typename": "field",
										"id": "170c324a-821f-4c5d-a25f-a7443b2f751d",
										"name": "favorites"
									}
								},
								"toRelationMetadata": {
									"__typename": "relation",
									"id": "f9177e4d-571d-450a-babb-c109af5b18d6",
									"relationType": "ONE_TO_MANY",
									"fromFieldMetadataId": "170c324a-821f-4c5d-a25f-a7443b2f751d",
									"fromObjectMetadata": {
										"__typename": "object",
										"id": "afdbcc7a-95bc-4e30-917d-ba583448b405",
										"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
										"nameSingular": "opportunity",
										"namePlural": "opportunities",
										"isSystem": false,
										"isRemote": false
									}
								}
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "6d85f788-2aa9-4f20-b382-2e46e9fe0dae",
								"type": "UUID",
								"name": "companyId",
								"label": "Company id (foreign key)",
								"description": "Favorite company id foreign key",
								"icon": "IconBuildingSkyscraper",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": true,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "fb6ac052-14c2-4138-9d68-e4decf0bec4f",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "1f2fdf33-a1f3-4df7-8d9d-fb6e15517888",
								"type": "UUID",
								"name": "workspaceMemberId",
								"label": "Workspace Member id (foreign key)",
								"description": "Favorite workspace member id foreign key",
								"icon": "IconCircleUser",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": null,
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		},
		{
			"__typename": "objectEdge",
			"node": {
				"__typename": "object",
				"id": "0216ee5f-8ac5-4e61-86e0-8c533db93a69",
				"dataSourceId": "516da07d-6504-41f8-907c-db5c0a19785c",
				"nameSingular": "webhook",
				"namePlural": "webhooks",
				"labelSingular": "Webhook",
				"labelPlural": "Webhooks",
				"description": "A webhook",
				"icon": "IconRobot",
				"isCustom": false,
				"isRemote": false,
				"isActive": true,
				"isSystem": true,
				"createdAt": "2024-06-07T09:05:12.599Z",
				"updatedAt": "2024-06-07T09:05:12.599Z",
				"labelIdentifierFieldMetadataId": null,
				"imageIdentifierFieldMetadataId": null,
				"fields": {
					"__typename": "ObjectFieldsConnection",
					"pageInfo": {
						"__typename": "PageInfo",
						"hasNextPage": false,
						"hasPreviousPage": false,
						"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
						"endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
					},
					"edges": [
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "736afdae-80f6-4fc6-87a0-22efc070a9b6",
								"type": "UUID",
								"name": "id",
								"label": "Id",
								"description": "Id",
								"icon": "Icon123",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "uuid",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "dcb735ad-251b-4a50-80a7-a288e1eedef6",
								"type": "TEXT",
								"name": "operation",
								"label": "Operation",
								"description": "Webhook operation",
								"icon": "IconCheckbox",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "816b9b66-a5d4-4988-ac56-839293cf1da6",
								"type": "DATE_TIME",
								"name": "updatedAt",
								"label": "Update date",
								"description": "Update date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "34f57a7f-448b-4b35-ab66-312a4c1ce002",
								"type": "DATE_TIME",
								"name": "createdAt",
								"label": "Creation date",
								"description": "Creation date",
								"icon": "IconCalendar",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "now",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						},
						{
							"__typename": "fieldEdge",
							"node": {
								"__typename": "field",
								"id": "31b3f963-f42c-4edf-a7ea-3d6e78d811d5",
								"type": "TEXT",
								"name": "targetUrl",
								"label": "Target Url",
								"description": "Webhook target url",
								"icon": "IconLink",
								"isCustom": false,
								"isActive": true,
								"isSystem": true,
								"isNullable": false,
								"createdAt": "2024-06-07T09:05:12.599Z",
								"updatedAt": "2024-06-07T09:05:12.599Z",
								"defaultValue": "''",
								"options": null,
								"relationDefinition": null,
								"fromRelationMetadata": null,
								"toRelationMetadata": null
							}
						}
					]
				}
			}
		}
	]
}
 
} as ObjectMetadataItemsQuery;

