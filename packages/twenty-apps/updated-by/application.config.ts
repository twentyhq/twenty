import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: "113d22d6-6711-4c1f-807d-b69203d3a503",
  displayName: "updated_by",
  description: "Updates Updated by field with details of person behind newest update",
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: "23df8d62-22b9-4d8e-9af9-b48c88a3c41b",
      isSecret: true,
      value: "",
      description: "Required, used to send requests to Twenty"
    },
    TWENTY_API_URL: {
      universalIdentifier: "aa8b9a8b-aded-48f2-bc30-fe9f0e6f4c60",
      isSecret: false,
      value: "",
      description: "Optional, defaults to cloud API URL"
    },
  },
}

export default config;
