import { BadRequestException, Injectable } from '@nestjs/common';

import { Query } from 'src/engine/api/rest/types/query.type';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { capitalize } from 'src/utils/capitalize';
import { parseMetadataPath } from 'src/engine/api/rest/rest-api-core-query-builder/utils/path-parsers/parse-metadata-path.utils';
import {
  GraphqlApiType,
  RestApiService,
} from 'src/engine/api/rest/services/rest-api.service';

@Injectable()
export class RestApiMetadataService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly restApiService: RestApiService,
  ) {}

  fetchMetadataFields(objectNamePlural: string) {
    const fields = `
          type
          name
          label
          description
          icon
          isCustom
          isActive
          isSystem
          isNullable
          createdAt
          updatedAt
          fromRelationMetadata {
            id
            relationType
            toObjectMetadata {
              id
              dataSourceId
              nameSingular
              namePlural
              isSystem
            }
            toFieldMetadataId
          }
          toRelationMetadata {
            id
            relationType
            fromObjectMetadata {
              id
              dataSourceId
              nameSingular
              namePlural
              isSystem
            }
            fromFieldMetadataId
          }
          defaultValue
          options
        `;

    switch (objectNamePlural) {
      case 'objects':
        return `
          dataSourceId
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isCustom
          isActive
          isSystem
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          fields(paging: { first: 1000 }) {
            edges {
              node {
                id
                ${fields}
              }
            }
          }
        `;
      case 'fields':
        return fields;
      case 'relations':
        return `
          relationType
          fromObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
          }
          fromObjectMetadataId
          toObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
          }
          toObjectMetadataId
          fromFieldMetadataId
          toFieldMetadataId
        `;
    }
  }

  generateFindManyQuery(objectNameSingular: string, objectNamePlural: string) {
    const fields = this.fetchMetadataFields(objectNamePlural);

    let filterType = '';
    let filterValue = '';

    if (objectNamePlural !== 'relations') {
      filterType = `($filter: ${objectNameSingular}Filter)`;
      filterValue = 'filter: $filter,';
    }

    return `
      query FindMany${capitalize(objectNamePlural)}${filterType} {
        ${objectNamePlural}(
        ${filterValue}
        paging: { first: 1000 }
        ) {
          edges {
            node {
              id
              ${fields}
              }
          }
        }
      }
    `;
  }

  generateFindOneQuery(objectNameSingular: string, objectNamePlural: string) {
    const fields = this.fetchMetadataFields(objectNamePlural);

    return `
      query FindOne${capitalize(objectNameSingular)}(
        $id: UUID!,
        ) {
        ${objectNameSingular}(id: $id) {
          id
          ${fields}
        }
      }
    `;
  }

  async get(request) {
    await this.tokenService.validateToken(request);

    const { objectNameSingular, objectNamePlural, id } =
      parseMetadataPath(request);

    const query = id
      ? this.generateFindOneQuery(objectNameSingular, objectNamePlural)
      : this.generateFindManyQuery(objectNameSingular, objectNamePlural);

    const data: Query = {
      query,
      variables: id ? { id } : request.body,
    };

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async create(request) {
    await this.tokenService.validateToken(request);

    const { objectNameSingular: objectName, objectNamePlural } =
      parseMetadataPath(request);
    const objectNameCapitalized = capitalize(objectName);

    const fields = this.fetchMetadataFields(objectNamePlural);

    const query = `
            mutation Create${objectNameCapitalized}($input: CreateOne${objectNameCapitalized}Input!) {
              createOne${objectNameCapitalized}(input: $input) {
                id
                ${fields}
              }
            }
          `;

    const data: Query = {
      query,
      variables: {
        input: {
          [objectName]: request.body,
        },
      },
    };

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async update(request) {
    await this.tokenService.validateToken(request);

    const {
      objectNameSingular: objectName,
      objectNamePlural,
      id,
    } = parseMetadataPath(request);
    const objectNameCapitalized = capitalize(objectName);

    if (!id) {
      throw new BadRequestException(
        `update ${objectName} query invalid. Id missing. eg: /rest/metadata/${objectName}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }
    const fields = this.fetchMetadataFields(objectNamePlural);

    const query = `
            mutation Update${objectNameCapitalized}($input: UpdateOne${objectNameCapitalized}Input!) {
              updateOne${objectNameCapitalized}(input: $input) {
                id
                ${fields}
              }
            }
          `;

    const data: Query = {
      query,
      variables: {
        input: {
          update: request.body,
          id,
        },
      },
    };

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async delete(request) {
    await this.tokenService.validateToken(request);

    const { objectNameSingular: objectName, id } = parseMetadataPath(request);
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

    const data: Query = {
      query,
      variables: {
        input: {
          id,
        },
      },
    };

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }
}
