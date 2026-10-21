import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTitleCellSingleTextDisplayMode } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldDisplay';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const renderTitle = (title: string) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
        __typename: 'Person',
        id: RECORD_ID,
        [textfieldDefinition.metadata.fieldName]: title,
      });
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <FieldContext.Provider
        value={{
          fieldDefinition: textfieldDefinition,
          recordId: RECORD_ID,
          isLabelIdentifier: true,
          isRecordFieldReadOnly: false,
        }}
      >
        <RecordTitleCellSingleTextDisplayMode
          containerType={RecordTitleCellContainerType.PageHeader}
        />
      </FieldContext.Provider>
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('RecordTitleCellSingleTextDisplayMode', () => {
  it('should display the title', () => {
    renderTitle('Weekly sync');

    expect(screen.getByText('Weekly sync')).toBeInTheDocument();
  });

  it('should say a restricted title is not shared rather than print the sentinel', () => {
    renderTitle(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED);

    expect(screen.getByText('Not shared')).toBeInTheDocument();
    expect(
      screen.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
  });
});
