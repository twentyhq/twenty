import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

import { RecordTableAggregateColumnPages } from '@/object-record/record-column-aggregate/components/RecordTableAggregateColumnPages';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunitiesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'opportunities',
});
const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
  fieldName: 'amount',
});

const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MetadataWrapper>{children}</MetadataWrapper>
  </I18nProvider>
);

const renderAggregateColumnPages = (onSelect: jest.Mock) =>
  render(
    <Dropdown.Root type="menu" defaultOpen>
      <Dropdown.Trigger>Columns</Dropdown.Trigger>
      <Dropdown.Content aria-label="Columns">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="opportunities">
            Opportunities relation
          </Dropdown.ActionItem>
        </Dropdown.Page>
        <RecordTableAggregateColumnPages
          pageId="opportunities"
          relationFieldMetadataItem={opportunitiesField}
          onSelect={onSelect}
        />
      </Dropdown.Content>
    </Dropdown.Root>,
    { wrapper: Wrapper },
  );

describe('RecordTableAggregateColumnPages', () => {
  it('adds a count of the related records', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderAggregateColumnPages(onSelect);

    await user.click(screen.getByText('Opportunities relation'));
    await user.click(await screen.findByText('Count'));

    expect(onSelect).toHaveBeenCalledWith({
      relationAggregateOperation: AggregateOperations.COUNT,
    });
  });

  it('adds an operation picked for a field of the related records', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderAggregateColumnPages(onSelect);

    await user.click(screen.getByText('Opportunities relation'));
    await user.click(await screen.findByText(amountField.label));

    expect(await screen.findByText('Average')).toBeVisible();

    await user.click(screen.getByText('Sum'));

    expect(onSelect).toHaveBeenCalledWith({
      relationTargetFieldMetadataId: amountField.id,
      relationAggregateOperation: AggregateOperations.SUM,
    });
  });
});
