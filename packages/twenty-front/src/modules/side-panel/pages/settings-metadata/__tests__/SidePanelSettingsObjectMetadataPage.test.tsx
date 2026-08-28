import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { SidePanelSettingsObjectMetadataPage } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsObjectMetadataPage';
import { viewableObjectMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableObjectMetadataIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const openRecordsInSidePanelMock = jest.fn();
const openSettingsFieldMetadataInSidePanelMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenRecordsInSidePanel', () => ({
  useOpenRecordsInSidePanel: () => ({
    openRecordsInSidePanel: openRecordsInSidePanelMock,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenSettingsFieldMetadataInSidePanel', () => ({
  useOpenSettingsFieldMetadataInSidePanel: () => ({
    openSettingsFieldMetadataInSidePanel:
      openSettingsFieldMetadataInSidePanelMock,
  }),
}));

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const renderSettingsObjectMetadataPage = (objectMetadataId: string | null) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(
        viewableObjectMetadataIdComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        objectMetadataId,
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

  return render(<SidePanelSettingsObjectMetadataPage />, { wrapper });
};

describe('SidePanelSettingsObjectMetadataPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the object and its fields', () => {
    renderSettingsObjectMetadataPage(companyObjectMetadataItem.id);

    expect(
      screen.getByText(companyObjectMetadataItem.labelPlural),
    ).toBeInTheDocument();
    expect(
      screen.getByText(companyObjectMetadataItem.namePlural),
    ).toBeInTheDocument();
    expect(screen.getByText(nameFieldMetadataItem.label)).toBeInTheDocument();
  });

  it('should open a field beside the object', async () => {
    renderSettingsObjectMetadataPage(companyObjectMetadataItem.id);

    await userEvent.click(screen.getByText(nameFieldMetadataItem.label));

    expect(openSettingsFieldMetadataInSidePanelMock).toHaveBeenCalledWith({
      fieldMetadataId: nameFieldMetadataItem.id,
    });
  });

  it('should open the records of the object', async () => {
    renderSettingsObjectMetadataPage(companyObjectMetadataItem.id);

    await userEvent.click(
      screen.getByText(`See ${companyObjectMetadataItem.labelPlural}`),
    );

    expect(openRecordsInSidePanelMock).toHaveBeenCalledWith({
      objectNameSingular: companyObjectMetadataItem.nameSingular,
    });
  });

  it('should render nothing for an unknown object', () => {
    const { container } = renderSettingsObjectMetadataPage(null);

    expect(container).toBeEmptyDOMElement();
  });
});
