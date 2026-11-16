import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

import { RecordTableLookupColumnPage } from '@/object-record/record-column-lookup/components/RecordTableLookupColumnPage';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const company = getMockObjectMetadataItemOrThrow('company');
const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
  fieldName: 'company',
});
const employeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'employees',
});
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'people',
});

const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MetadataWrapper>{children}</MetadataWrapper>
  </I18nProvider>
);

const renderLookupColumnPage = (onSelect: jest.Mock) =>
  render(
    <Dropdown.Root type="menu" defaultOpen>
      <Dropdown.Trigger>Columns</Dropdown.Trigger>
      <Dropdown.Content aria-label="Columns">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="company">
            Company relation
          </Dropdown.ActionItem>
        </Dropdown.Page>
        <RecordTableLookupColumnPage
          pageId="company"
          relationFieldMetadataItem={personCompanyField}
          onSelect={onSelect}
        />
      </Dropdown.Content>
    </Dropdown.Root>,
    { wrapper: Wrapper },
  );

describe('RecordTableLookupColumnPage', () => {
  it('adds a lookup of the picked field of the related record', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderLookupColumnPage(onSelect);

    await user.click(screen.getByText('Company relation'));
    await user.click(await screen.findByText(employeesField.label));

    expect(onSelect).toHaveBeenCalledWith({
      relationTargetFieldMetadataId: employeesField.id,
    });
  });

  it('does not offer the relations of the related record', async () => {
    const user = userEvent.setup();

    renderLookupColumnPage(jest.fn());

    await user.click(screen.getByText('Company relation'));

    expect(await screen.findByText(employeesField.label)).toBeVisible();
    expect(screen.queryByText(peopleField.label)).not.toBeInTheDocument();
  });
});
