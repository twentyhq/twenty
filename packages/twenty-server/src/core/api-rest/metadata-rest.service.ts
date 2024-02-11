import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ApiRestQueryBuilderFactory } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.factory';
import { ApiRestQuery } from 'src/core/api-rest/types/api-rest-query.type';
import { TokenService } from 'src/core/auth/services/token.service';
import { parseMetadataPath } from 'src/core/api-rest/api-rest-query-builder/utils/parse-path.utils';
import { capitalize } from 'src/utils/capitalize';

@Injectable()
export class ApiRestMetadataService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly apiRestQueryBuilderFactory: ApiRestQueryBuilderFactory,
    private readonly httpService: HttpService,
  ) {}

  async callMetadata(request, data: ApiRestQuery) {
    const baseUrl =
      this.environmentService.getServerUrl() ||
      `${request.protocol}://${request.get('host')}`;

    try {
      return await this.httpService.axiosRef.post(`${baseUrl}/metadata`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.authorization,
        },
      });
    } catch (err) {
      return {
        data: {
          error: `${err}. Please check your query.`,
          status: err.response.status,
        },
      };
    }
  }

  async fetchMetadataFields(request, fieldName: string) {
    const query = `
            query { 
                __type(name: "${fieldName}") { 
                    inputFields { name } 
                }
            }
        `;
    const data: ApiRestQuery = {
      query,
      variables: {},
    };

    const { data: response } = await this.callMetadata(request, data);
    const fields = response.data.__type.inputFields.map((field) => field.name);

    return fields;
  }

  async create(request) {
    try {
      await this.tokenService.validateToken(request);

      const { object: objectName } = parseMetadataPath(request);
      const objectNameCapitalized = capitalize(objectName);

      const fieldName = `Create${objectNameCapitalized}Input`;
      const fields = await this.fetchMetadataFields(request, fieldName);

      const query = `
            mutation Create${objectNameCapitalized}($input: CreateOne${objectNameCapitalized}Input!) {
              createOne${objectNameCapitalized}(input: $input) {
                id
                ${fields.map((field) => field).join('\n')}
              }
            }
          `;

      const data: ApiRestQuery = {
        query,
        variables: {
          input: {
            [objectName]: request.body,
          },
        },
      };

      return await this.callMetadata(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }

  async update(request) {
    try {
      await this.tokenService.validateToken(request);

      const { object: objectName, id } = parseMetadataPath(request);
      const objectNameCapitalized = capitalize(objectName);

      if (!id) {
        throw new BadRequestException(
          `update ${objectName} query invalid. Id missing. eg: /rest/metadata/${objectName}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
        );
      }
      const fieldName = `Update${objectNameCapitalized}Input`;
      const fields = await this.fetchMetadataFields(request, fieldName);

      const query = `
            mutation Update${objectNameCapitalized}($input: UpdateOne${objectNameCapitalized}Input!) {
              updateOne${objectNameCapitalized}(input: $input) {
                id
                ${fields.map((field) => field).join('\n')}
              }
            }
          `;

      const data: ApiRestQuery = {
        query,
        variables: {
          input: {
            update: request.body,
            id,
          },
        },
      };

      return await this.callMetadata(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }

  async delete(request) {
    try {
      await this.tokenService.validateToken(request);

      const { object: objectName, id } = parseMetadataPath(request);
      const objectNameCapitalized = capitalize(objectName);

      if (!id) {
        throw new BadRequestException(
          `delete ${objectName} query invalid. Id missing. eg: /rest/metadata/${objectName}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
        );
      }

      const query = `
            mutation Delete${objectNameCapitalized}($input: DeleteOne${objectNameCapitalized}Input!) {
              deleteOne${objectNameCapitalized}(input: $input) {
                id
              }
            }
          `;

      const data: ApiRestQuery = {
        query,
        variables: {
          input: {
            id,
          },
        },
      };

      return await this.callMetadata(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }
}
