import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, renderHook, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { EditableRelationFilterChip } from '@/views/editable-chip/components/EditableRelationFilterChip';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const morphRelationFieldMetadataItem = getMockObjectMetadataItemOrThrow(
  'timelineActivity',
).fields.find((field) => field.type === FieldMetadataType.MORPH_RELATION);

if (!isDefined(morphRelationFieldMetadataItem)) {
  throw new Error('Missing morph relation field on timelineActivity');
}

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyRelationFieldMetadataItem = getMockObjectMetadataItemOrThrow(
  'person',
).fields.find((field) => field.name === 'company');

if (!isDefined(companyRelationFieldMetadataItem)) {
  throw new Error('Missing company relation field on person');
}

const COMPANY_RECORD_ID = '20202020-3ec3-4fe3-8997-b76aa0bfa408';

const morphRecordFilter: RecordFilter = {
  id: 'record-filter-morph',
  fieldMetadataId: morphRelationFieldMetadataItem.id,
  operand: ViewFilterOperand.IS_NOT_EMPTY,
  value: '',
  displayValue: '',
  type: 'RELATION',
  label: morphRelationFieldMetadataItem.label,
};

const companyRecordFilter: RecordFilter = {
  id: 'record-filter-company',
  fieldMetadataId: companyRelationFieldMetadataItem.id,
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: false,
    selectedRecordIds: [COMPANY_RECORD_ID],
  }),
  displayValue: '',
  type: 'RELATION',
  label: companyRelationFieldMetadataItem.label,
};

const getWrapper = (
  apolloMocks: Parameters<
    typeof getJestMetadataAndApolloMocksWrapper
  >[0]['apolloMocks'],
) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({ apolloMocks });

  return ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <JestMetadataAndApolloMocksWrapper>
        {children}
      </JestMetadataAndApolloMocksWrapper>
    </I18nProvider>
  );
};

describe('EditableRelationFilterChip', () => {
  it('should render a filter on a morph relation field', () => {
    render(
      <EditableRelationFilterChip
        recordFilter={morphRecordFilter}
        onRemove={jest.fn()}
      />,
      { wrapper: getWrapper([]) },
    );

    expect(
      screen.getByText(morphRelationFieldMetadataItem.label),
    ).toBeInTheDocument();
    expect(screen.getByText(/NotEmpty/)).toBeInTheDocument();
  });

  it('should render the selected record names of a relation filter', async () => {
    const { result: combinedQuery } = renderHook(
      () =>
        useGenerateCombinedFindManyRecordsQuery({
          operationSignatures: [
            {
              objectNameSingular: companyObjectMetadataItem.nameSingular,
              variables: { filter: { id: { in: [COMPANY_RECORD_ID] } } },
              fields: buildIdentifierGqlFields(companyObjectMetadataItem),
            },
          ],
        }),
      { wrapper: getWrapper([]) },
    );

    if (!isDefined(combinedQuery.current)) {
      throw new Error('Combined query was not generated');
    }

    render(
      <EditableRelationFilterChip
        recordFilter={companyRecordFilter}
        onRemove={jest.fn()}
      />,
      {
        wrapper: getWrapper([
          {
            request: {
              query: combinedQuery.current,
              variables: {
                filterCompany: { id: { in: [COMPANY_RECORD_ID] } },
              },
            },
            result: {
              data: {
                companies: {
                  __typename: 'CompanyConnection',
                  edges: [
                    {
                      __typename: 'CompanyEdge',
                      cursor: 'cursor',
                      node: {
                        __typename: 'Company',
                        id: COMPANY_RECORD_ID,
                        name: 'Acme',
                        domainName: {
                          __typename: 'Links',
                          primaryLinkUrl: 'acme.com',
                          primaryLinkLabel: '',
                          secondaryLinks: [],
                        },
                      },
                    },
                  ],
                  pageInfo: {
                    __typename: 'PageInfo',
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: 'cursor',
                    endCursor: 'cursor',
                  },
                  totalCount: 1,
                },
              },
            },
          },
        ]),
      },
    );

    expect(await screen.findByText(/Acme/)).toBeInTheDocument();
  });
});
