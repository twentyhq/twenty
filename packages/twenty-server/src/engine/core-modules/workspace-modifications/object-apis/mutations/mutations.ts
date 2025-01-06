import { createArxEnrichments } from "../services/arxEnrichmentsService";

export const mutations = {
  createObject: `
        mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
            createOneObject(input: $input) {
                id
                dataSourceId
                nameSingular
                namePlural
                labelSingular
                labelPlural
                description
                icon
                isCustom
                isActive
                createdAt
                updatedAt
                labelIdentifierFieldMetadataId
                imageIdentifierFieldMetadataId
            }
        }
    `,
  createRelation: `
        mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {
            createOneRelation(input: $input) {
                id
                relationType
                fromObjectMetadataId
                toObjectMetadataId
                fromFieldMetadataId
                toFieldMetadataId
                createdAt
                updatedAt
            }
        }
    `,

  createField: `
        mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
            createOneField(input: $input) {
                id
                type
                name
                label
                description
                icon
                isCustom
                isActive
                isNullable
                createdAt
                updatedAt
                defaultValue
                options
            }
        }
    `,
  createAIModel: `
    mutation CreateOneAIModel($input: AIModelCreateInput!) {
        createAIModel(data: $input) {
            id
            name
            country
            language
            createdAt
            updatedAt
        }
    }
`,

  createAIInterview: `
    mutation CreateOneAIInterview($input: AIInterviewCreateInput!) {
        createAIInterview(data: $input) {
            id
            name
            aIModelId
            jobId
            introduction
            instructions
            createdAt
            updatedAt
        }
    }
`,
  createArxEnrichments: `
        mutation CreateOneCandidateEnrichment($input: CandidateEnrichmentCreateInput!) {
            createCandidateEnrichment(data: $input) {
          id
          name
          position
          createdAt
          updatedAt
        }
      }`,
};
