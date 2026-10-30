import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

const morphRecordFilter: RecordFilter = {
  id: 'record-filter-morph',
  fieldMetadataId: morphRelationFieldMetadataItem.id,
  operand: ViewFilterOperand.IS_NOT_EMPTY,
  value: '',
  displayValue: '',
  type: 'RELATION',
  label: morphRelationFieldMetadataItem.label,
};

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <JestMetadataAndApolloMocksWrapper>
      {children}
    </JestMetadataAndApolloMocksWrapper>
  </I18nProvider>
);

describe('EditableRelationFilterChip', () => {
  it('should render a filter on a morph relation field', () => {
    render(
      <EditableRelationFilterChip
        recordFilter={morphRecordFilter}
        onRemove={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      },
    );

    expect(
      screen.getByText(morphRelationFieldMetadataItem.label),
    ).toBeInTheDocument();
    expect(screen.getByText(/NotEmpty/)).toBeInTheDocument();
  });
});
