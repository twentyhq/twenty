import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class GraphqlQueryGroupByResolverService extends GraphqlQueryBaseResolverService<
  GroupByResolverArgs,
  IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<GroupByResolverArgs>,
    _featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;

    const groupByFields = this.parseGroupByArgs(
      executionArgs.args,
      objectMetadataItemWithFieldMaps,
    );

    const aggregateMetrics = Object.keys(
      executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
    );

    const mockedGroupByValues = Array.from({ length: 3 }, (_, index) => ({
      groupByDimensionValues: groupByFields.map((groupByField) =>
        this.getFakeDimensionValues(groupByField, index),
      ),
      ...aggregateMetrics.reduce(
        (acc, aggregateMetric, subIndex) => {
          acc[aggregateMetric] = this.getFakeAggregateValues(subIndex + index);

          return acc;
        },
        {} as Record<string, number>,
      ),
    }));

    return mockedGroupByValues as unknown as IGroupByConnection<
      ObjectRecord,
      IEdge<ObjectRecord>
    >[];
  }

  private parseGroupByArgs(
    args: GroupByResolverArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): { fieldMetadata: FieldMetadataEntity; subFieldName?: string }[] {
    const groupByFieldNames = args.groupBy;

    const groupByFields = [];

    for (const fieldNames of groupByFieldNames) {
      if (Object.keys(fieldNames).length > 1) {
        throw new GraphqlQueryRunnerException(
          'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        );
      }
      for (const fieldName of Object.keys(fieldNames)) {
        const fieldMetadataId =
          objectMetadataItemWithFieldMaps.fieldIdByName[fieldName];
        const fieldMetadata =
          objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

        if (fieldNames[fieldName] === true) {
          groupByFields.push({
            fieldMetadata,
            subFieldName: undefined,
          });
          continue;
        } else if (typeof fieldNames[fieldName] === 'object') {
          if (Object.keys(fieldNames[fieldName]).length > 1) {
            throw new GraphqlQueryRunnerException(
              'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            );
          }
          for (const subFieldName of Object.keys(fieldNames[fieldName])) {
            if (fieldNames[fieldName][subFieldName] === true) {
              groupByFields.push({
                fieldMetadata,
                subFieldName,
              });
              continue;
            }
          }
        }
      }
    }

    return groupByFields;
  }

  async validate(
    _args: GroupByResolverArgs<ObjectRecordFilter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {}

  //todo : remove these methods after the groupBy logic implementation
  private getFakeDimensionValues(
    groupByField: {
      fieldMetadata: FieldMetadataEntity;
      subFieldName?: string;
    },
    rank: number,
  ): string {
    const fakeDimensionValuesByField = {
      [FieldMetadataType.TEXT]: [
        'Text 1',
        'Long long long long and long text 2',
        'Text 3',
      ],
      [FieldMetadataType.NUMERIC]: [2000, 3000, 4000],
      [FieldMetadataType.NUMBER]: [1, 2, 3],
      [FieldMetadataType.BOOLEAN]: [true, false, true],
      [FieldMetadataType.DATE_TIME]: [
        new Date(2025, 5, 10, 12, 1, 0),
        new Date(2025, 5, 10, 12, 1, 0),
        new Date(2018, 6, 14, 12, 2, 0),
      ],
      [FieldMetadataType.DATE]: [
        new Date(2025, 1, 1),
        new Date(2025, 1, 2),
        new Date(2025, 1, 3),
      ],
      [FieldMetadataType.UUID]: [
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
      ],
      [FieldMetadataType.SELECT]: ['Option 1', 'Option 2', 'Option 3'],
      [FieldMetadataType.MULTI_SELECT]: [
        ['Tag 1', 'Tag 2'],
        ['Tag 3'],
        ['Tag 4', 'Tag 5', 'Tag 6'],
      ],
      [FieldMetadataType.RELATION]: [
        { id: 'relation-1', name: 'Relation 1' },
        { id: 'relation-2', name: 'Relation 2' },
        { id: 'relation-3', name: 'Relation 3' },
      ],
      [FieldMetadataType.MORPH_RELATION]: [
        { id: 'morph-1', name: 'Morph Relation 1' },
        { id: 'morph-2', name: 'Morph Relation 2' },
        { id: 'morph-3', name: 'Morph Relation 3' },
      ],
      [FieldMetadataType.RATING]: ['RATING_3', 'RATING_4', 'RATING_5'],
      [FieldMetadataType.RAW_JSON]: [
        { key: 'value1' },
        { key: 'value2', key2: 'value2' },
        {},
      ],
      [FieldMetadataType.ARRAY]: [['value1', 'value2'], ['value3'], []],
      [FieldMetadataType.POSITION]: [1, 2, 3],
      [FieldMetadataType.TS_VECTOR]: ['vector1', 'vector2', 'vector3'],
      [FieldMetadataType.EMAILS]: [
        {
          primaryEmail: 'tim@twenty.com',
          additionalEmails: [
            'tim@twenty.com',
            'timapple@twenty.com',
            'johnappletim@twenty.com',
          ],
        },
        {
          primaryEmail: 'jane@twenty.com',
          additionalEmails: ['jane@twenty.com', 'jane.doe@twenty.com'],
        },
        {
          primaryEmail: 'john@twenty.com',
          additionalEmails: ['john.doe@twenty.com'],
        },
      ],
      [FieldMetadataType.PHONES]: [
        {
          primaryPhoneCallingCode: '+33',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneNumber: '789012345',
          additionalPhones: [
            { number: '617272323', callingCode: '+33', countryCode: 'FR' },
          ],
        },
        {
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          primaryPhoneNumber: '612345789',
          additionalPhones: [
            { number: '123456789', callingCode: '+1', countryCode: 'US' },
            { number: '617272323', callingCode: '+1', countryCode: 'US' },
          ],
        },
        {
          primaryPhoneCallingCode: '+33',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneNumber: '123456789',
          additionalPhones: [],
        },
      ],
      [FieldMetadataType.CURRENCY]: [
        { amountMicros: 1000000, currencyCode: 'USD' },
        { amountMicros: 2000000, currencyCode: 'EUR' },
        { amountMicros: 3000000, currencyCode: 'GBP' },
      ],
      [FieldMetadataType.LINKS]: [
        {
          primaryLinkUrl: 'twenty.com',
          primaryLinkLabel: '',
          secondaryLinks: [{ url: 'twenty.com', label: 'Twenty' }],
        },
        {
          primaryLinkUrl: 'github.com/twentyhq/twenty',
          primaryLinkLabel: 'Twenty Repo',
          secondaryLinks: [{ url: 'twenty.com', label: '' }],
        },
        {
          primaryLinkUrl: 'react.dev',
          primaryLinkLabel: '',
          secondaryLinks: [],
        },
      ],
      [FieldMetadataType.FULL_NAME]: [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Smith' },
      ],
      [FieldMetadataType.ADDRESS]: [
        {
          addressStreet1: '456 Oak Street',
          addressStreet2: '',
          addressCity: 'Springfield',
          addressState: 'California',
          addressCountry: 'United States',
          addressPostcode: '90210',
          addressLat: 34.0522,
          addressLng: -118.2437,
        },
        {
          addressStreet1: '123 Main Street',
          addressStreet2: '',
          addressCity: 'New York',
          addressState: 'New York',
          addressCountry: 'United States',
          addressPostcode: '10001',
          addressLat: 40.7128,
          addressLng: -74.006,
        },
        {
          addressStreet1: '8 rue Saint-Anne',
          addressStreet2: '',
          addressCity: 'Paris',
          addressState: 'Ile-de-France',
          addressCountry: 'France',
          addressPostcode: '75001',
          addressLat: 40.7128,
          addressLng: -74.006,
        },
      ],
      [FieldMetadataType.ACTOR]: [
        {
          source: 'IMPORT',
          name: 'name',
          workspaceMemberId: 'id',
          context: { provider: 'GOOGLE' },
        },
        {
          source: 'MANUAL',
          name: 'name',
          workspaceMemberId: 'id',
          context: { provider: 'MICROSOFT' },
        },
        {
          source: 'WEBHOOK',
          name: 'name',
          workspaceMemberId: 'id',
          context: {},
        },
      ],
      [FieldMetadataType.RICH_TEXT_V2]: [
        {
          blocknote: '[{"type":"heading","content":"Hello"}]',
          markdown: '# Hello',
        },
        {
          blocknote: '[{"type":"heading","content":"Hello World"}]',
          markdown: '# Hello World',
        },
        {
          blocknote: '[{"type":"heading","content":"Hello Again"}]',
          markdown: '# Hello Again',
        },
      ],
      [FieldMetadataType.RICH_TEXT]: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as Record<FieldMetadataType, any>;

    const fakeDimensionValues =
      fakeDimensionValuesByField[groupByField.fieldMetadata.type][rank % 3];

    return isDefined(groupByField.subFieldName)
      ? fakeDimensionValues[groupByField.subFieldName].toString()
      : fakeDimensionValues.toString();
  }

  private getFakeAggregateValues(rank: number) {
    const fakeAggregateValues = [39, 20, 56, 88, 2];

    return fakeAggregateValues[rank % fakeAggregateValues.length];
  }
}
