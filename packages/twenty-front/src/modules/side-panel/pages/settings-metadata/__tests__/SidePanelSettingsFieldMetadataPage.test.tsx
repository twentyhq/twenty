import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { SidePanelSettingsFieldMetadataPage } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsFieldMetadataPage';
import { viewableFieldMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableFieldMetadataIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const openSettingsObjectMetadataInSidePanelMock = jest.fn();

jest.mock(
  '@/side-panel/hooks/useOpenSettingsObjectMetadataInSidePanel',
  () => ({
    useOpenSettingsObjectMetadataInSidePanel: () => ({
      openSettingsObjectMetadataInSidePanel:
        openSettingsObjectMetadataInSidePanelMock,
    }),
  }),
);

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const renderSettingsFieldMetadataPage = (fieldMetadataId: string | null) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(
        viewableFieldMetadataIdComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        fieldMetadataId,
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: PAGE_INSTANCE_ID }}
        >
          {children}
        </SidePanelPageComponentInstanceContext.Provider>
      </I18nProvider>
    </BaseWrapper>
  );

  return render(<SidePanelSettingsFieldMetadataPage />, { wrapper });
};

describe('SidePanelSettingsFieldMetadataPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the field and the object it belongs to', () => {
    renderSettingsFieldMetadataPage(nameFieldMetadataItem.id);

    expect(screen.getByText(nameFieldMetadataItem.label)).toBeInTheDocument();
    expect(screen.getByText(nameFieldMetadataItem.name)).toBeInTheDocument();
    expect(
      screen.getByText(companyObjectMetadataItem.labelPlural),
    ).toBeInTheDocument();
  });

  it('should open the object of the field', async () => {
    renderSettingsFieldMetadataPage(nameFieldMetadataItem.id);

    await userEvent.click(
      screen.getByText(companyObjectMetadataItem.labelPlural),
    );

    expect(openSettingsObjectMetadataInSidePanelMock).toHaveBeenCalledWith({
      objectMetadataId: companyObjectMetadataItem.id,
    });
  });

  it('should render nothing for an unknown field', () => {
    const { container } = renderSettingsFieldMetadataPage(null);

    expect(container).toBeEmptyDOMElement();
  });
});
