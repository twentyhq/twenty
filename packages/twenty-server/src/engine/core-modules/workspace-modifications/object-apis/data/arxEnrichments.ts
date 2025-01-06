import { Enrichment } from "../types/types";


export const arxEnrichments: Enrichment[] = [
    {
        modelName: "DistanceFromJob",
        prompt: "For the given location below, return the distance in kilometeres between the location and the Surat, Gujarat, India. Return only the distance in kilometers. No explanation is needed.",
        fields: [
            {
                name: "distanceFromJob",
                type: "number",
                description: "This is the distance of the location from Surat, Gujarat, India in kilometers",
                id: 1733655403505
            }
        ],
        selectedMetadataFields: ["currentLocation"],
        selectedModel: "gpt4omini"
    },
    {
        modelName: "JobTitleClasssification",
        prompt: "Classify the given job title into one of the following function categories - sales, marketing, finance, legal and levels - entry, mid, senior, executive.",
        fields: [
            {
                name: "Function",
                type: "text",
                description: "This is the function within which the job title is classified",
                id: 1733654764250
            },
            {
                name: "Level",
                type: "text",
                description: "This is the level within which the job title is classified",
                id: 1733655310939
            }
        ],
        selectedMetadataFields: ["resumeHeadline", "jobTitle"],
        selectedModel: "gpt4omini"
    },
    {
        modelName: "CompanyType",
        prompt: "The company below is an Indian company or an MNC having presence in India. Based on your knowledge, determine if the company is a mid or large sized family run business? ",
        fields: [
            {
              "id": 1734686767872,
              "name": "isCompanyMidOrLargeSizedFamilyRunBusiness",
              "type": "boolean",
              "enumValues": [],
              "description": "Is the company a mid or large sized family run business?"
            },
            {
              "id": 1734686798686,
              "name": "isAMidorLargeSizedCompany",
              "type": "enum",
              "enumValues": [
                "mid-sized",
                "large-sized"
              ],
              "description": "Is the company a mid or large sized company?"
            },
            {
              "id": 1734686819201,
              "name": "isAFamilyRunBusiness",
              "type": "text",
              "enumValues": [],
              "description": "Is the company a family run business - Return True or False?"
            }
          ],
        selectedMetadataFields: ["currentOrganization"],
        selectedModel: "gpt4omini"
    },
    {
        modelName: "HRFunctionClasssification",
        prompt: "Classify if the job title is a HR job title or not. Return only yes or no. No explanation necessary.",
        fields: [
            {
              "id": 1733654764250,
              "name": "isFromHRFunction",
              "type": "text",
              "description": "Is from the HR Function"
            }
          ],
        selectedMetadataFields: [
            "resumeHeadline",
            "jobTitle"
          ],
        selectedModel: "gpt4omini"
    },
    {
        modelName: "ReportingManagerClassification",
        prompt: "Does this candidate report to either the MD/ Chairman/ CEO/ CMD/ Director HR/ CHRO/ HR Head? Return True or False. No explanation necessary",
        fields: [
            {
              "id": 1734686602382,
              "name": "isReportingToLeadership",
              "type": "text",
              "enumValues": [],
              "description": "True or False"
            }
          ],
        selectedMetadataFields:[
            "ansWhichPositionDoYouReportTo"
          ],
        selectedModel: "gpt4omini"
    }
];