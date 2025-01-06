import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';

interface ApiKeyResponse {
  data: {
    createApiKey: {
      id: string;
      name: string;
      expiresAt: string;
      createdAt: string;
      updatedAt: string;
      revokedAt: null | string;
    }
  }
}

interface ApiKeyTokenResponse {
  data: {
    generateApiKeyToken: {
      token: string;
    }
  }
}

export class ApiKeyService {
  private readonly baseUrl: string;
  
  constructor(baseUrl: string = process.env.GRAPHQL_URL || 'http://localhost:3000/graphql') {
    this.baseUrl = baseUrl;
  }

  private async graphqlRequest(query: string, variables: any, authToken: string) {
    return axios.request({
      method: 'post',
      url: this.baseUrl,
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      data: {
        query,
        variables,
      },
    });
  }

  async createApiKey(authToken: string, name: string = 'test_api_key'): Promise<string> {
    try {
      // Calculate expiry date 100 years in the future
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      
    const apiKeyId = uuidV4();

      // Create API Key
      const createKeyMutation = `
        mutation CreateOneApiKey($input: ApiKeyCreateInput!) {
          createApiKey(data: $input) {
            id
            name
            expiresAt
            updatedAt
            revokedAt
            createdAt
          }
        }
      `;

      const createKeyVariables = {
        input: {
          name,
          expiresAt: expiresAt.toISOString(),
          id: apiKeyId,
        },
      };

      const createKeyResponse = await this.graphqlRequest(
        createKeyMutation,
        createKeyVariables,
        authToken
      );

      // Generate API Key Token
      const generateTokenMutation = `
        mutation GenerateApiKeyToken($apiKeyId: String!, $expiresAt: String!) {
          generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
            token
          }
        }
      `;

      const generateTokenVariables = {
        apiKeyId,
        expiresAt: expiresAt.toISOString(),
      };

      const tokenResponse = await this.graphqlRequest(
        generateTokenMutation,
        generateTokenVariables,
        authToken
      );

      console.log('API Key created:', createKeyResponse.data);

      const apiToken = tokenResponse.data.data.generateApiKeyToken.token;
      console.log('API Key token:', apiToken);

      // Update Twenty API Keys
      // No need to connect with Arxena Yet
      // await this.updateTwentyApiKeys(apiToken, authToken);

      return apiToken;

    } catch (error) {
      console.error('Error in API key creation:', error);
      throw new Error('Failed to create API key');
    }
  }

  private async updateTwentyApiKeys(twentyApiKey: string, authToken: string): Promise<void> {
    try {

      let arxenaSiteBaseUrl: string = '';
      console.log("process.env.ENV_NODE", process.env.ENV_NODE);
      if (process.env.ENV_NODE === 'development') {

        arxenaSiteBaseUrl = process.env.REACT_APP_ARXENA_SITE_BASE_URL || 'http://127.0.0.1:5050';
      } else {
        arxenaSiteBaseUrl = process.env.REACT_APP_ARXENA_SITE_BASE_URL || 'https://arxena.com';
      }

      console.log("Updating Twenty API keys", arxenaSiteBaseUrl);
      const response = await axios.post(
        arxenaSiteBaseUrl+'/update-twenty-api-keys',
        { twenty_api_key: twentyApiKey },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("Response from update twenty api keys", response.data);

    } catch (error) {
      console.error('Error updating Twenty API keys:', error);
      throw new Error('Failed to update Twenty API keys');
    }
  }
}