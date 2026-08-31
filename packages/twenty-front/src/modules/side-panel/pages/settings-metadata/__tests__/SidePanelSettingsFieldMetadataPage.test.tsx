import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { SidePanelSettingsFieldMetadataPage } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsFieldMetadataPage';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const openSidePanelArtifactMock = jest.fn();

jest.mock('@/side-panel/artifacts/hooks/useOpenSidePanelArtifact', () => ({
  useOpenSidePanelArtifact: () => ({
    openSidePanelArtifact: openSidePanelArtifactMock,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const renderSettingsFieldMetadataPage = (fieldMetadataId: string) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </BaseWrapper>
  );

  return render(
    <SidePanelSettingsFieldMetadataPage fieldMetadataId={fieldMetadataId} />,
    { wrapper },
  );
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

    expect(openSidePanelArtifactMock).toHaveBeenCalledWith({
      artifactPath: getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: companyObjectMetadataItem.namePlural,
      }),
    });
  });

  it('should render nothing for an unknown field', () => {
    const { container } = renderSettingsFieldMetadataPage(
      'unknown-field-metadata-id',
    );

    expect(container).toBeEmptyDOMElement();
  });
});
